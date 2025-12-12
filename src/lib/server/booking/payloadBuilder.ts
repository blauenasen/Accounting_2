// Module: src/lib/server/booking/payloadBuilder.ts
// Builds complete journal entry payload from form data

import type { JournalEntry } from '../invoice-to-journal.js';
import type Database from 'better-sqlite3';

/**
 * Calculate tax details based on brutto amount, tax rate, and S/H indicator
 */
function calculateTaxDetails(brutto: number, bu: number, sh: string) {
  const bruttoAbs = Math.abs(brutto);
  let nettoGes = 0;
  let steuer = 0;
  let vStUSt = 0;

  if (bu > 0) {
    // Tax applicable
    nettoGes = bruttoAbs / (1 + bu / 100);
    steuer = bruttoAbs - nettoGes;
    vStUSt = sh === 'S' ? steuer : -steuer;
  } else {
    // No tax
    nettoGes = bruttoAbs;
    steuer = 0;
    vStUSt = 0;
  }

  return {
    nettoGes: Number(nettoGes.toFixed(2)),
    steuer: Number(steuer.toFixed(2)),
    vStUSt: Number(vStUSt.toFixed(2))
  };
}

/**
 * Get Sammelkto based on account category
 */
function getSammelkto(category?: string): number | null {
  if (category === 'creditor') return 70000;
  if (category === 'debitor') return 10000;
  return null;
}

/**
 * Get OPVortragGegKto based on account category
 */
function getOPVortragGegKto(category?: string): number | null {
  if (category === 'creditor') return 70001;
  if (category === 'debitor') return 10001;
  return null;
}

/**
 * Get SteuerKto (Tax Account) based on S/H indicator
 */
function getSteuerKto(sh: string): number {
  return sh === 'S' ? 1776 : 1406;
}

/**
 * Get JAPosSteuer based on S/H indicator
 */
function getJAPosSteuer(sh: string): string {
  return sh === 'S' ? 'Vorst' : 'Umsatzst';
}

/**
 * Parse date components from ISO date string (YYYY-MM-DD)
 */
function parseDateComponents(dateStr: string) {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  return {
    jahr: parseInt(yearStr, 10),
    monat: parseInt(monthStr, 10),
    tag: parseInt(dayStr, 10)
  };
}

/**
 * Build complete journal entry payload from form data
 */
export async function buildJournalPayload(
  formData: any,
  context: {
    bookCircle: string | number;
    accountDetails: any;
    contraAccountDetails: any;
    idNr?: number;
  },
  db: Database.Database
): Promise<JournalEntry> {
  // Parse date components
  const { jahr, monat, tag } = parseDateComponents(formData.date);

  // Parse accounts
  const kto = formData.account ? parseInt(formData.account, 10) : null;
  const gegKto = formData.contraAccount ? parseInt(formData.contraAccount, 10) : null;

  // Parse tax rate (BU)
  const bu = formData.tax ? parseFloat(formData.tax) : 0;

  // Parse brutto amount (turnover)
  const turnoverStr = String(formData.turnover || '0')
    .replace(/[^\d.,-]/g, '')
    .replace(',', '.');
  const turnoverAbs = parseFloat(turnoverStr) || 0;

  // Determine UE (1 or -1) and brutto
  const ue = formData.sh === 'H' ? -1 : 1;
  const brutto = ue * turnoverAbs;

  // Calculate tax details
  const taxCalc = calculateTaxDetails(brutto, bu, formData.sh);

  // Parse book circle
  const bookCircleNo =
    typeof context.bookCircle === 'number'
      ? context.bookCircle
      : parseInt(String(context.bookCircle), 10);

  // Build journal entry
  const journalEntry: JournalEntry = {
    // Primary keys
    Jahr: jahr,
    Monat: monat,
    Tag: tag,
    LfdNr: undefined, // Will be calculated by insertJournalEntry
    BuNr: null, // Will be calculated by insertJournalEntry

    // Accounts
    Kto: kto,
    GegKto: gegKto,

    // Amounts
    UE: ue,
    Brutto: brutto,
    NettoGes: taxCalc.nettoGes,
    Steuer: taxCalc.steuer,
    VStUSt: taxCalc.vStUSt,

    // S/H split amounts
    SBrutto: formData.sh === 'S' ? brutto : null,
    HBrutto: formData.sh === 'H' ? brutto : null,
    SNetto: formData.sh === 'S' ? taxCalc.nettoGes : null,
    HNetto: formData.sh === 'H' ? taxCalc.nettoGes : null,
    SVSTUSt: formData.sh === 'S' && bu > 0 ? taxCalc.vStUSt : null,
    HVSTUSt: formData.sh === 'H' && bu > 0 ? taxCalc.vStUSt : null,

    // Debit/Credit indicators
    SH: formData.sh || 'S',
    GU: null, // Only for Stornierungen
    BU: bu > 0 ? String(bu) : null,

    // Reference and description
    BelNr: formData.reference || '',
    Buchungstext: formData.description || '',

    // Date fields
    Datum: formData.date || '',
    Fälligkeit: formData.due || null,

    // Invoice link
    id_invoice: formData.id_invoice || null,

    // Edit mode: Include IdNr if editing existing entry
    IdNr: context.idNr || undefined,

    // Metadata from account details (HK)
    JAKtoBereich: context.accountDetails?.jabereich || null,
    JAKtoPosArt: context.accountDetails?.japos || null,

    // Metadata from contra account details (CK)
    JAGegKtoBereich: context.contraAccountDetails?.jabereich || null,
    JAGegKtoPosArt: context.contraAccountDetails?.japos || null,

    // Contra account specific fields
    Sammelkto: getSammelkto(context.contraAccountDetails?.category),
    OPVortragGegKto: getOPVortragGegKto(context.contraAccountDetails?.category),

    // Tax-related fields (only if BU > 0)
    SteuerKto: bu > 0 ? getSteuerKto(formData.sh) : null,
    JASteuer: bu > 0 ? 'Bil' : null,
    JAPosSteuer: bu > 0 ? getJAPosSteuer(formData.sh) : null,

    // Standard fields
    SachVortragKto: 9000,
    BookCircle: bookCircleNo,

    // Defaults
    Gesperrt: 0,
    Warnung: null,
    BL: null,
    AusziffNr: null,
    AusziffArt: null
  };

  return journalEntry;
}
