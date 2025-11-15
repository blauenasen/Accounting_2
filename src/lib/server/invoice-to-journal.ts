// src/lib/server/invoice-to-journal.ts
// Converts invoice data to journal entry with booking rules applied

import { db } from './index.js';
import { getAllowedAccounts } from './booking/account-rules.js';
import type Database from 'better-sqlite3';

/**
 * Date components structure
 */
interface DateComponents {
  jahr: number;
  monat: number;
  tag: number;
}

/**
 * Journal entry structure (full schema)
 */
export interface JournalEntry {
  IdNr?: number;
  Jahr: number;
  Monat: number;
  Tag: number;
  LfdNr?: number;
  BuNr?: string | null;
  Kto: number | null;
  GegKto: number | null;
  Brutto: number;
  NettoGes: number;
  Steuer: number;
  VStUSt: number;
  SH: string;
  GU: string | null;
  BelNr: string;
  Buchungstext: string;
  Datum: string;
  Fälligkeit: string | null;
  id_invoice: number | null;
  Gesperrt: number;
  Warnung: string | null;
  BL: string | null;
  UE: number;
  BU: string | null;
  AusziffNr: number | null;
  AusziffArt: string | null;
  JAGegKtoBereich: string | null;
  JAGegKtoPosArt: string | null;
  BookCircle: number;
  JAKtoBereich: string | null;
  JAKtoPosArt: string | null;
  SBrutto: number | null;
  HBrutto: number | null;
  SNetto: number | null;
  HNetto: number | null;
  SVSTUSt: number | null;
  HVSTUSt: number | null;
  SteuerKto: number | null;
  JASteuer: string | null;
  JAPosSteuer: string | null;
  Sammelkto: number | null;
  OPVortragGegKto: number | null;
  SachVortragKto: number | null;
}

/**
 * Options for insertJournalEntry
 */
export interface InsertJournalOptions {
  ignoreDuplicate?: boolean;
  isUpdate?: boolean;
}

/**
 * Result of journal entry insertion
 */
export interface InsertJournalResult {
  ok: boolean;
  IdNr: number;
  Jahr: number;
  Monat: number;
  LfdNr: number;
  BuNr: string | null;
}

/**
 * Gets the next LfdNr for the given Jahr/Monat/BookCircle
 * @param jahr Year
 * @param monat Month (1-12)
 * @param bookCircle Book circle number
 * @returns Next LfdNr
 */
function getNextLfdNr(jahr: number, monat: number, bookCircle: number): number {
  const row = db.prepare(`
    SELECT COALESCE(MAX(LfdNr), 0) as maxLfdNr
    FROM journal
    WHERE Jahr = ? AND Monat = ? AND BookCircle = ?
  `).get(jahr, monat, bookCircle) as { maxLfdNr: number } | undefined;

  return (row?.maxLfdNr || 0) + 1;
}

/**
 * Parses a date string (DD.MM.YYYY or ISO) to year/month/day components
 * @param dateStr Date string
 * @returns Date components
 */
function parseDateComponents(dateStr: string): DateComponents {
  let date: Date;

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('.');
    date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  return {
    jahr: date.getFullYear(),
    monat: date.getMonth() + 1,
    tag: date.getDate()
  };
}

/**
 * Determines the HK account (Konto) using booking rules
 * @param buKreis Book circle number
 * @param debtorAccount Debtor account number
 * @param debtorCategory Debtor category
 * @returns Konto account number or null if no rule matches
 */
function determineHKAccount(buKreis: number, debtorAccount: number | null, debtorCategory: string | null): number | null {
  try {
    const { accounts } = getAllowedAccounts({
      bookCircle: buKreis,
      side: 'HK'
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    if (debtorAccount) {
      const exactMatch = accounts.find(a => a.account === debtorAccount);
      if (exactMatch) {
        return exactMatch.account;
      }
    }

    if (debtorCategory) {
      const categoryMatch = accounts.find(a =>
        a.category && a.category.toUpperCase() === debtorCategory.toUpperCase()
      );
      if (categoryMatch) {
        return categoryMatch.account;
      }
    }

    return accounts[0]?.account || null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`invoice-to-journal.determineHKAccount failed: ${error.message}`);
    }
    return null;
  }
}

/**
 * Converts an invoice to a pre-filled journal entry
 * @param id_invoice Invoice ID
 * @returns Journal entry data ready for booking UI
 */
export async function convertInvoiceToJournal(id_invoice: number): Promise<JournalEntry> {
  const invoice = db.prepare(`
    SELECT * FROM invoice WHERE id_invoice = ?
  `).get(id_invoice) as Record<string, unknown> | undefined;

  if (!invoice) {
    throw new Error(`Invoice ${id_invoice} not found`);
  }

  if (!invoice.blocked || Number(invoice.blocked) === 0) {
    throw new Error(`Invoice ${id_invoice} is not blocked. Only blocked invoices can be handed over to accounting.`);
  }

  if (invoice.booked && Number(invoice.booked) === 1) {
    throw new Error(`Invoice ${id_invoice} is already booked (invoice.booked=1). Cannot create duplicate journal entry.`);
  }

  const lines = db.prepare(`
    SELECT
      l.id_line,
      l.id_invoice,
      l.id_rate,
      l.description,
      l.qty,
      CASE WHEN r.blocked = 1 THEN 0 ELSE COALESCE(r.rate, 0) END as rate,
      r.service
    FROM invoice_db l
    LEFT JOIN rates r ON l.id_rate = r.id_rate
    WHERE l.id_invoice = ?
    ORDER BY l.id_line
  `).all(id_invoice) as Array<Record<string, unknown>>;

  let debtor: Record<string, unknown> | undefined;
  if (invoice.account) {
    debtor = db.prepare(`
      SELECT * FROM debtors WHERE account = ?
    `).get(Number(invoice.account)) as Record<string, unknown> | undefined;
  }

  const stammdaten = db.prepare(`SELECT * FROM stammdaten LIMIT 1`).get() as Record<string, unknown> | undefined;
  const globalTaxPct = Number(stammdaten?.tax ?? 0);

  const subtotal = lines.reduce((sum, line) => {
    const qty = Number(line.qty ?? 0);
    const rate = Number(line.rate ?? 0);
    const amount = qty * rate;
    return sum + amount;
  }, 0);

  const tax = lines.reduce((sum, line) => {
    const qty = Number(line.qty ?? 0);
    const rate = Number(line.rate ?? 0);
    const amount = qty * rate;
    return sum + (amount * globalTaxPct / 100);
  }, 0);

  const total = subtotal + tax;

  const dateComponents = parseDateComponents(String(invoice.date || new Date().toISOString()));
  const bookCircle = 20;

  const lfdNr = getNextLfdNr(dateComponents.jahr, dateComponents.monat, bookCircle);

  const debtorAccount = debtor?.account ? Number(debtor.account) : null;
  const debtorCategory = debtor?.category ? String(debtor.category) : null;
  const konto = determineHKAccount(bookCircle, debtorAccount, debtorCategory);

  const invoiceNr = `I-${invoice.year}-${invoice.num}`;

  const estimateText = invoice.estimateNr
    ? `Service based on ${invoice.estimateNr}`
    : 'Service without Estimate';

  return {
    Jahr: dateComponents.jahr,
    Monat: dateComponents.monat,
    Tag: dateComponents.tag,
    LfdNr: lfdNr,
    Kto: konto,
    GegKto: null,
    Brutto: Math.round(total * 100) / 100,
    NettoGes: Math.round(subtotal * 100) / 100,
    Steuer: Math.round(tax * 100) / 100,
    VStUSt: Math.round(tax * 100) / 100,
    SH: 'H',
    GU: 'S',
    BelNr: invoiceNr,
    Buchungstext: estimateText,
    Datum: String(invoice.date),
    Fälligkeit: null,
    id_invoice: id_invoice,
    Gesperrt: 0,
    Warnung: null,
    BL: null,
    BuNr: null,
    UE: 0,
    BU: null,
    AusziffNr: null,
    AusziffArt: null,
    JAGegKtoBereich: null,
    JAGegKtoPosArt: null,
    BookCircle: bookCircle,
    JAKtoBereich: null,
    JAKtoPosArt: null,
    SBrutto: null,
    HBrutto: null,
    SNetto: null,
    HNetto: null,
    SVSTUSt: null,
    HVSTUSt: null,
    SteuerKto: null,
    JASteuer: null,
    JAPosSteuer: null,
    Sammelkto: null,
    OPVortragGegKto: null,
    SachVortragKto: null
  };
}

/**
 * Generates BuNr in format mm-yyyy/LfdNr
 * @param monat Month (1-12)
 * @param jahr Year
 * @param lfdNr Sequential number
 * @returns BuNr string
 */
function generateBuNr(monat: number, jahr: number, lfdNr: number): string {
  const monthStr = String(monat).padStart(2, '0');
  const lfdNrStr = String(lfdNr).padStart(4, '0');
  return `${monthStr}-${jahr}/${lfdNrStr}`;
}

/**
 * Checks for duplicate journal entry
 * @param ue UE value
 * @param kto Main account
 * @param gegKto Counter account
 * @param belNr Document number
 * @param datum Date
 * @returns True if duplicate exists
 */
function checkDuplicate(ue: number, kto: number | null, gegKto: number | null, belNr: string, datum: string): boolean {
  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM journal
    WHERE UE = ?
      AND Kto = ?
      AND GegKto = ?
      AND BelNr = ?
      AND Datum = ?
      AND (GU IS NULL OR GU = '' OR GU = 0)
  `).get(ue, kto, gegKto, belNr, datum) as { count: number } | undefined;

  return (result?.count || 0) > 0;
}

/**
 * Inserts or updates a journal entry in the database
 * @param journalEntry Journal entry object
 * @param options Options object
 * @returns Result with IdNr of inserted/updated entry
 */
export function insertJournalEntry(journalEntry: JournalEntry, options: InsertJournalOptions = {}): InsertJournalResult {
  if (options.isUpdate && journalEntry.IdNr) {
    const stmt = db.prepare(`
      UPDATE journal SET
        Gesperrt = @Gesperrt,
        Jahr = @Jahr,
        Monat = @Monat,
        Tag = @Tag,
        Warnung = @Warnung,
        BL = @BL,
        AusziffNr = @AusziffNr,
        AusziffArt = @AusziffArt,
        UE = @UE,
        SH = @SH,
        GU = @GU,
        BU = @BU,
        GegKto = @GegKto,
        JAGegKtoBereich = @JAGegKtoBereich,
        JAGegKtoPosArt = @JAGegKtoPosArt,
        BelNr = @BelNr,
        Datum = @Datum,
        Kto = @Kto,
        BookCircle = @BookCircle,
        JAKtoBereich = @JAKtoBereich,
        JAKtoPosArt = @JAKtoPosArt,
        Buchungstext = @Buchungstext,
        Fälligkeit = @Fälligkeit,
        Brutto = @Brutto,
        SBrutto = @SBrutto,
        HBrutto = @HBrutto,
        NettoGes = @NettoGes,
        SNetto = @SNetto,
        HNetto = @HNetto,
        Steuer = @Steuer,
        VStUSt = @VStUSt,
        SVSTUSt = @SVSTUSt,
        HVSTUSt = @HVSTUSt,
        SteuerKto = @SteuerKto,
        JASteuer = @JASteuer,
        JAPosSteuer = @JAPosSteuer,
        Sammelkto = @Sammelkto,
        OPVortragGegKto = @OPVortragGegKto,
        SachVortragKto = @SachVortragKto,
        id_invoice = @id_invoice
      WHERE IdNr = @IdNr
    `);

    stmt.run(journalEntry);

    const updatedEntry = db.prepare('SELECT LfdNr, BuNr FROM journal WHERE IdNr = ?').get(journalEntry.IdNr) as { LfdNr: number; BuNr: string | null } | undefined;

    return {
      ok: true,
      IdNr: journalEntry.IdNr,
      Jahr: journalEntry.Jahr,
      Monat: journalEntry.Monat,
      LfdNr: updatedEntry?.LfdNr || journalEntry.LfdNr || 0,
      BuNr: updatedEntry?.BuNr || journalEntry.BuNr || null
    };
  }

  const jahr = journalEntry.Jahr;
  const monat = journalEntry.Monat;
  const bookCircle = journalEntry.BookCircle;

  journalEntry.LfdNr = getNextLfdNr(jahr, monat, bookCircle);
  journalEntry.BuNr = generateBuNr(monat, jahr, journalEntry.LfdNr);

  if (!options.ignoreDuplicate) {
    const isDuplicate = checkDuplicate(
      journalEntry.UE,
      journalEntry.Kto,
      journalEntry.GegKto,
      journalEntry.BelNr,
      journalEntry.Datum
    );

    if (isDuplicate) {
      throw new Error('DUPLICATE_BOOKING');
    }
  }

  const stmt = db.prepare(`
    INSERT INTO journal (
      Gesperrt, Jahr, Monat, Tag, LfdNr, BuNr, Warnung, BL,
      AusziffNr, AusziffArt, UE, SH, GU, BU, GegKto, JAGegKtoBereich, JAGegKtoPosArt,
      BelNr, Datum, Kto, BookCircle, JAKtoBereich, JAKtoPosArt, Buchungstext, Fälligkeit,
      Brutto, SBrutto, HBrutto, NettoGes, SNetto, HNetto, Steuer, VStUSt, SVSTUSt, HVSTUSt,
      SteuerKto, JASteuer, JAPosSteuer, Sammelkto, OPVortragGegKto, SachVortragKto, id_invoice
    ) VALUES (
      @Gesperrt, @Jahr, @Monat, @Tag, @LfdNr, @BuNr, @Warnung, @BL,
      @AusziffNr, @AusziffArt, @UE, @SH, @GU, @BU, @GegKto, @JAGegKtoBereich, @JAGegKtoPosArt,
      @BelNr, @Datum, @Kto, @BookCircle, @JAKtoBereich, @JAKtoPosArt, @Buchungstext, @Fälligkeit,
      @Brutto, @SBrutto, @HBrutto, @NettoGes, @SNetto, @HNetto, @Steuer, @VStUSt, @SVSTUSt, @HVSTUSt,
      @SteuerKto, @JASteuer, @JAPosSteuer, @Sammelkto, @OPVortragGegKto, @SachVortragKto, @id_invoice
    )
  `);

  const info = stmt.run(journalEntry);

  return {
    ok: true,
    IdNr: Number(info.lastInsertRowid),
    Jahr: journalEntry.Jahr,
    Monat: journalEntry.Monat,
    LfdNr: journalEntry.LfdNr!,
    BuNr: journalEntry.BuNr!
  };
}
