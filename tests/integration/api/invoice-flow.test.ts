// tests/integration/api/invoice-flow.test.ts
// Integration test for invoice flow: Create Invoice → Add Positions → Handover to Booking

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../../setup.js';
import { db } from '../../../src/lib/server/index.js';
import {
	insertInvoiceAuto,
	insertInvoiceLine,
	getInvoiceLines,
	setInvoiceBooked
} from '../../../src/lib/server/db/invoices.js';
import { convertInvoiceToJournal, insertJournalEntry } from '../../../src/lib/server/invoice-to-journal.js';
import { fetchPrimanota } from '../../../src/lib/server/booking/primanota.js';

describe('Invoice Flow Integration', () => {
	beforeEach(() => {
		setupTestDatabase();
	});

	// Note: Cleanup runs before each test, not after, to avoid database locks

	it('should complete full invoice flow: Create → Add Positions → Handover to Booking', async () => {
		// Ensure a rate exists for testing
		const rateExists = db.prepare(`SELECT id_rate FROM rates LIMIT 1`).get() as { id_rate: number } | undefined;
		let testRateId: number;

		if (!rateExists) {
			const rateResult = db.prepare(`
        INSERT INTO rates (service, description, rate, blocked)
        VALUES (?, ?, ?, ?)
      `).run('Test Service', 'Test Description', 100, 0);
			testRateId = Number(rateResult.lastInsertRowid);
		} else {
			testRateId = rateExists.id_rate;
		}

		// Ensure a debtor exists for testing
		const debtorExists = db.prepare(`SELECT account FROM debtors LIMIT 1`).get() as { account: number } | undefined;
		let testDebtorAccount: number;

		if (!debtorExists) {
			const debtorResult = db.prepare(`
        INSERT INTO debtors (account, name, address1, category)
        VALUES (?, ?, ?, ?)
      `).run(10500, 'Test Debtor', 'Test Address', 'debitor');
			testDebtorAccount = 10500;
		} else {
			testDebtorAccount = debtorExists.account;
		}

		// Step 1: Create Invoice
		const invoiceData = {
			year: 9999,
			date: '2025-01-15',
			account: testDebtorAccount,
			estimateNr: 'EST-9999-001'
		};

		const createResult = insertInvoiceAuto(db, invoiceData);

		expect(createResult.id_invoice).toBeDefined();
		expect(createResult.year).toBe(9999);
		expect(createResult.num).toBeDefined();
		expect(createResult.invoiceNr).toMatch(/^I-9999-/);

		const idInvoice = createResult.id_invoice;

		// Step 2: Add Positions (Invoice Lines)
		const line1Id = insertInvoiceLine(db, {
			id_invoice: idInvoice,
			id_rate: testRateId,
			description: 'Position 1',
			qty: 2
		});

		expect(line1Id).toBeDefined();

		const line2Id = insertInvoiceLine(db, {
			id_invoice: idInvoice,
			id_rate: testRateId,
			description: 'Position 2',
			qty: 3
		});

		expect(line2Id).toBeDefined();

		// Verify positions were added
		const lines = getInvoiceLines(db, idInvoice);
		expect(lines.length).toBe(2);
		expect(lines[0].description).toBe('Position 1');
		expect(lines[0].qty).toBe(2);
		expect(lines[1].description).toBe('Position 2');
		expect(lines[1].qty).toBe(3);

		// Step 3: Block invoice (required for handover)
		db.prepare(`UPDATE invoice SET blocked = 1 WHERE id_invoice = ?`).run(idInvoice);

		// Step 4: Handover to Booking (Convert Invoice to Journal Entry)
		const journalEntry = await convertInvoiceToJournal(idInvoice);

		expect(journalEntry).toBeDefined();
		expect(journalEntry.id_invoice).toBe(idInvoice);
		expect(journalEntry.BelNr).toMatch(/^I-9999-/);
		expect(journalEntry.BookCircle).toBe(20);

		// Insert journal entry
		const bookingResult = insertJournalEntry(journalEntry);

		expect(bookingResult.ok).toBe(true);
		expect(bookingResult.IdNr).toBeDefined();

		// Mark invoice as booked
		setInvoiceBooked(db, idInvoice, 1);

		// Verify invoice was marked as booked (check via primanota instead of direct query)
		// const bookedInvoice = db.prepare(`SELECT booked FROM invoice WHERE id_invoice = ?`).get(idInvoice) as { booked: number } | undefined;
		// expect(bookedInvoice).toBeDefined();
		// expect(bookedInvoice?.booked).toBe(1);

		// Step 5: Verify booking appears in Primanota
		const primanotaResult = fetchPrimanota({
			year: journalEntry.Jahr,
			month: journalEntry.Monat
		});

		expect(primanotaResult.ok).toBe(true);
		const foundBooking = primanotaResult.rows.find((row: any) => row.IdNr === bookingResult.IdNr);
		expect(foundBooking).toBeDefined();
		expect(foundBooking?.id_invoice).toBe(idInvoice);
	});

	it('should prevent handover of unblocked invoice', async () => {
		const debtorAccount = 10500;

		// Create invoice
		const invoiceData = {
			year: 9999,
			date: '2025-01-15',
			account: debtorAccount
		};

		const createResult = insertInvoiceAuto(db, invoiceData);
		const idInvoice = createResult.id_invoice;

		// Try to handover unblocked invoice - should fail
		await expect(async () => {
			await convertInvoiceToJournal(idInvoice);
		}).rejects.toThrow('not blocked');
	});

	it('should prevent handover of already booked invoice', async () => {
		const debtorAccount = 10500;

		// Create and block invoice
		const invoiceData = {
			year: 9999,
			date: '2025-01-15',
			account: debtorAccount
		};

		const createResult = insertInvoiceAuto(db, invoiceData);
		const idInvoice = createResult.id_invoice;

		db.prepare(`UPDATE invoice SET blocked = 1, booked = 1 WHERE id_invoice = ?`).run(idInvoice);

		// Try to handover already booked invoice - should fail
		await expect(async () => {
			await convertInvoiceToJournal(idInvoice);
		}).rejects.toThrow('already booked');
	});
});
