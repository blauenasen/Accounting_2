// src/lib/server/index.ts
// Central database access layer

import Database from 'better-sqlite3';
import { ensureSchema } from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine database path (supports .env configuration)
const DB_PATH = process.env.DB_PATH || 'db.sqlite';

// Create database instance
const db = new Database(DB_PATH, { fileMustExist: true });

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Run schema migrations
ensureSchema(db);

// Export database instance
export { db };
export default db;

/**
 * Get database instance (legacy compatibility)
 */
export function getDb(): Database.Database {
  return db;
}

/**
 * Legacy export for compatibility
 */
export const connection = db;

// Import and re-export all DB modules
import * as stammdaten from './db/stammdaten.js';
import * as rates from './db/rates.js';
import * as debtors from './db/debtors.js';
import * as creditors from './db/creditors.js';
import * as estimates from './db/estimates.js';
import * as invoices from './db/invoices.js';
import * as journal from './db/journal.js';

// Initialize modules with db instance
estimates.init(db);
invoices.init(db);

// Re-export stammdaten functions
export const getStammdaten = () => stammdaten.getStammdaten(db);
export const getEmailAccount = () => stammdaten.getEmailAccount(db);
export const setEmailAccount = (cfg: Parameters<typeof stammdaten.setEmailAccount>[1]) => stammdaten.setEmailAccount(db, cfg);
export const getMailBcc = () => stammdaten.getMailBcc(db);

// Re-export rates functions
export const getAllRates = () => rates.getAllRates(db);
export const insertRate = (rate: Parameters<typeof rates.insertRate>[1]) => rates.insertRate(db, rate);
export const updateRate = (rate: Parameters<typeof rates.updateRate>[1]) => rates.updateRate(db, rate);
export const deleteRate = (id_rate: number) => rates.deleteRate(db, id_rate);

// Re-export debtors functions
export const getDebtors = () => debtors.getDebtors(db);
export const getAllDebtors = () => debtors.getAllDebtors(db);
export const insertDebtor = (d: Parameters<typeof debtors.insertDebtor>[1]) => debtors.insertDebtor(db, d);
export const updateDebtor = (d: Parameters<typeof debtors.updateDebtor>[1]) => debtors.updateDebtor(db, d);
export const deleteDebtor = (account: number) => debtors.deleteDebtor(db, account);

// Re-export creditors functions
export const getCreditors = () => creditors.getCreditors(db);
export const getAllCreditors = () => creditors.getAllCreditors(db);
export const insertCreditor = (d: Parameters<typeof creditors.insertCreditor>[1]) => creditors.insertCreditor(db, d);
export const updateCreditor = (d: Parameters<typeof creditors.updateCreditor>[1]) => creditors.updateCreditor(db, d);
export const deleteCreditor = (account: number) => creditors.deleteCreditor(db, account);

// Re-export estimates functions
export const getAllEstimates = () => estimates.getAllEstimates(db);
export const insertEstimate = (est: Parameters<typeof estimates.insertEstimate>[1]) => estimates.insertEstimate(db, est);
export const updateEstimate = (est: Parameters<typeof estimates.updateEstimate>[1]) => estimates.updateEstimate(db, est);
export const updateEstimateHeaderDateAccount = (params: Parameters<typeof estimates.updateEstimateHeaderDateAccount>[1]) => estimates.updateEstimateHeaderDateAccount(db, params);
export const getEstimateLines = (id_estimate: number) => estimates.getEstimateLines(db, id_estimate);
export const insertEstimateLine = (line: Parameters<typeof estimates.insertEstimateLine>[1]) => estimates.insertEstimateLine(db, line);
export const updateEstimateLine = (line: Parameters<typeof estimates.updateEstimateLine>[1]) => estimates.updateEstimateLine(db, line);
export const deleteEstimateLine = (id_line: number) => estimates.deleteEstimateLine(db, id_line);
export const deleteEstimateLines = (ids: number[]) => estimates.deleteEstimateLines(db, ids);
export const saveEstimateLines = (lines: Parameters<typeof estimates.saveEstimateLines>[1]) => estimates.saveEstimateLines(db, lines);
export const getNextEstimateNum = () => estimates.getNextEstimateNum(db);
export const getEstimateHeaderById = (id_estimate: number) => estimates.getEstimateHeaderById(db, id_estimate);
export const getEstimateLineCount = (id_estimate: number) => estimates.getEstimateLineCount(db, id_estimate);
export const deleteEstimateLinesByEstimateId = (id_estimate: number) => estimates.deleteEstimateLinesByEstimateId(db, id_estimate);
export const deleteEstimateById = (id_estimate: number) => estimates.deleteEstimateById(db, id_estimate);
export const deleteEstimateHard = (id_estimate: number) => estimates.deleteEstimateHard(db, id_estimate);
export const lockEstimateAndLinesById = (id_estimate: number) => estimates.lockEstimateAndLinesById(db, id_estimate);
export const findEstimateIdByNr = (estimateNr: string) => estimates.findEstimateIdByNr(db, estimateNr);
export const lockEstimateAndLinesByNr = (estimateNr: string) => estimates.lockEstimateAndLinesByNr(db, estimateNr);
export const setEstimateBlocked = (year: number, num: number, blocked?: number) => estimates.setEstimateBlocked(db, year, num, blocked);
export const setEstimateBlockedByNr = (estimateNr: string, blocked?: number) => estimates.setEstimateBlockedByNr(db, estimateNr, blocked);
export const lockEstimateCascadeByNr = (estimateNr: string) => estimates.lockEstimateCascadeByNr(db, estimateNr);

// Re-export invoices functions
export const getAllInvoices = () => invoices.getAllInvoices(db);
export const insertInvoice = (inv: Parameters<typeof invoices.insertInvoice>[1]) => invoices.insertInvoice(db, inv);
export const insertInvoiceAuto = (inv: Parameters<typeof invoices.insertInvoiceAuto>[1]) => invoices.insertInvoiceAuto(db, inv);
export const updateInvoice = (inv: Parameters<typeof invoices.updateInvoice>[1]) => invoices.updateInvoice(db, inv);
export const updateInvoiceHeaderDateAccount = (p: Parameters<typeof invoices.updateInvoiceHeaderDateAccount>[1]) => invoices.updateInvoiceHeaderDateAccount(db, p);
export const getInvoiceLines = (id_invoice: number) => invoices.getInvoiceLines(db, id_invoice);
export const insertInvoiceLine = (line: Parameters<typeof invoices.insertInvoiceLine>[1]) => invoices.insertInvoiceLine(db, line);
export const updateInvoiceLine = (line: Parameters<typeof invoices.updateInvoiceLine>[1]) => invoices.updateInvoiceLine(db, line);
export const deleteInvoiceLine = (id_line: number) => invoices.deleteInvoiceLine(db, id_line);
export const deleteInvoiceLines = (ids: number[]) => invoices.deleteInvoiceLines(db, ids);
export const saveInvoiceLines = (lines: Parameters<typeof invoices.saveInvoiceLines>[1]) => invoices.saveInvoiceLines(db, lines);
export const getNextInvoiceNum = (year?: number) => invoices.getNextInvoiceNum(db, year);
export const getInvoiceHeaderById = (id_invoice: number) => invoices.getInvoiceHeaderById(db, id_invoice);
export const getInvoiceLineCount = (id_invoice: number) => invoices.getInvoiceLineCount(db, id_invoice);
export const deleteInvoiceLinesByInvoiceId = (id_invoice: number) => invoices.deleteInvoiceLinesByInvoiceId(db, id_invoice);
export const deleteInvoiceById = (id_invoice: number) => invoices.deleteInvoiceById(db, id_invoice);
export const deleteInvoiceHard = (id_invoice: number) => invoices.deleteInvoiceHard(db, id_invoice);
export const lockInvoiceAndLines = (id_invoice: number) => invoices.lockInvoiceAndLines(db, id_invoice);
export const setInvoiceBlocked = (id_invoice: number, blocked?: number) => invoices.setInvoiceBlocked(db, id_invoice, blocked);
export const lockInvoiceCascade = (id_invoice: number) => invoices.lockInvoiceCascade(db, id_invoice);
export const storePdfInInvoice = (id_invoice: number, pdfBuffer: Buffer) => invoices.storePdfInInvoice(db, id_invoice, pdfBuffer);
export const getInvoicePdf = (id_invoice: number) => invoices.getInvoicePdf(db, id_invoice);
export const setInvoiceBooked = (id_invoice: number, booked?: number) => invoices.setInvoiceBooked(db, id_invoice, booked);

// Re-export journal functions
export const storePdfInJournal = (idNr: number, pdfBuffer: Buffer) => journal.storePdfInJournal(db, idNr, pdfBuffer);
export const getJournalPdf = (idNr: number) => journal.getJournalPdf(db, idNr);
export const hasJournalPdf = (idNr: number) => journal.hasJournalPdf(db, idNr);
export const copyPdfFromInvoiceToJournal = (idNr: number, id_invoice: number) => journal.copyPdfFromInvoiceToJournal(db, idNr, id_invoice);
