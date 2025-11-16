// tests/integration/api/booking-flow.test.ts
// Integration test for booking flow: Create → Verify → Cancel → Verify Storno

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, createTestBookingPayload } from '../../setup.js';
import { insertJournalEntry } from '../../../src/lib/server/invoice-to-journal.js';
import { fetchPrimanota } from '../../../src/lib/server/booking/primanota.js';
import { db } from '../../../src/lib/server/index.js';

describe('Booking Flow Integration', () => {
	beforeEach(() => {
		setupTestDatabase();
	});

	// Note: Cleanup runs before each test, not after, to avoid database locks

	it('should complete full booking flow: Create → Verify → Cancel → Verify Storno', () => {
		// Step 1: Create a booking
		const bookingPayload = createTestBookingPayload({
			BelNr: 'FLOW-TEST-001',
			Buchungstext: 'Integration Test Booking',
			UE: 100.0,
			Brutto: 100.0
		});

		const createResult = insertJournalEntry(bookingPayload as any);

		expect(createResult.ok).toBe(true);
		expect(createResult.IdNr).toBeDefined();
		expect(createResult.LfdNr).toBeDefined();
		expect(createResult.Jahr).toBe(9999);
		expect(createResult.Monat).toBe(1);

		const idNr = createResult.IdNr;
		const lfdNr = createResult.LfdNr;

		// Step 2: Verify booking appears in Primanota
		const primanotaResult = fetchPrimanota({ year: 9999, month: 1 });

		expect(primanotaResult.ok).toBe(true);
		expect(primanotaResult.rows.length).toBeGreaterThan(0);

		const foundBooking = primanotaResult.rows.find((row: any) => row.IdNr === idNr);
		expect(foundBooking).toBeDefined();
		expect(foundBooking?.Buchungstext).toBe('Integration Test Booking');
		expect(foundBooking?.BelNr).toBe('FLOW-TEST-001');
		expect(foundBooking?.UE).toBe(100.0);

		// Step 3: Cancel the booking (create Storno entry)
		const maxGURow = db
			.prepare(`
        SELECT MAX(CAST(GU AS INTEGER)) as maxGU
        FROM journal
        WHERE GU IS NOT NULL
          AND GU != ''
          AND GU NOT LIKE '%[^0-9]%'
      `)
			.get() as any;

		const nextGU = maxGURow?.maxGU ? parseInt(maxGURow.maxGU, 10) + 1 : 1;

		const maxLfdNrRow = db
			.prepare(`
        SELECT MAX(LfdNr) as maxLfdNr
        FROM journal
        WHERE Jahr = ? AND Monat = ? AND BookCircle = ?
      `)
			.get(9999, 1, 10) as any;

		const nextLfdNr = (maxLfdNrRow?.maxLfdNr || 0) + 1;

		const stornoPayload = {
			...bookingPayload,
			LfdNr: nextLfdNr,
			BuNr: `01-9999/${String(nextLfdNr).padStart(4, '0')}`,
			GU: String(nextGU),
			SH: bookingPayload.SH === 'S' ? 'H' : 'S',
			UE: -bookingPayload.UE,
			Brutto: -bookingPayload.Brutto,
			NettoGes: -bookingPayload.NettoGes,
			SBrutto: bookingPayload.SH === 'S' ? null : -bookingPayload.Brutto,
			HBrutto: bookingPayload.SH === 'S' ? -bookingPayload.Brutto : null,
			SNetto: bookingPayload.SH === 'S' ? null : -bookingPayload.NettoGes,
			HNetto: bookingPayload.SH === 'S' ? -bookingPayload.NettoGes : null,
			Buchungstext: `❌ STORNO ${bookingPayload.Buchungstext}`
		};

		const stornoResult = insertJournalEntry(stornoPayload as any, { ignoreDuplicate: true });

		expect(stornoResult.ok).toBe(true);
		expect(stornoResult.IdNr).toBeDefined();

		// Step 4: Verify Storno entry appears in Primanota
		const primanotaAfterCancel = fetchPrimanota({ year: 9999, month: 1 });

		expect(primanotaAfterCancel.ok).toBe(true);
		expect(primanotaAfterCancel.rows.length).toBeGreaterThan(1);

		const foundStorno = primanotaAfterCancel.rows.find(
			(row: any) => row.IdNr === stornoResult.IdNr
		);
		expect(foundStorno).toBeDefined();
		expect(foundStorno?.Buchungstext).toContain('STORNO');
		expect(foundStorno?.GU).toBe(nextGU);
		expect(foundStorno?.UE).toBe(-100.0);
		expect(foundStorno?.Brutto).toBe(-100.0);

		// Step 5: Update original booking with GU number
		db.prepare(`UPDATE journal SET GU = ? WHERE IdNr = ?`).run(nextGU, idNr);

		const updatedOriginal = db
			.prepare(`SELECT * FROM journal WHERE IdNr = ?`)
			.get(idNr) as any;
		expect(updatedOriginal.GU).toBe(nextGU);
	});

	it('should prevent duplicate bookings', () => {
		const bookingPayload1 = createTestBookingPayload({
			BelNr: 'DUPLICATE-TEST',
			UE: 50.0,
			Brutto: 50.0
		});

		const firstResult = insertJournalEntry(bookingPayload1 as any);
		expect(firstResult.ok).toBe(true);

		// Create a second payload with same values (fresh object)
		const bookingPayload2 = createTestBookingPayload({
			BelNr: 'DUPLICATE-TEST',
			UE: 50.0,
			Brutto: 50.0
		});

		expect(() => {
			insertJournalEntry(bookingPayload2 as any);
		}).toThrow('DUPLICATE_BOOKING');
	});

	it('should allow duplicate bookings when ignoreDuplicate is true', () => {
		const bookingPayload = createTestBookingPayload({
			BelNr: 'ALLOWED-DUPLICATE',
			UE: 75.0,
			Brutto: 75.0
		});

		const firstResult = insertJournalEntry(bookingPayload as any);
		expect(firstResult.ok).toBe(true);

		const secondResult = insertJournalEntry(bookingPayload as any, { ignoreDuplicate: true });
		expect(secondResult.ok).toBe(true);
		expect(secondResult.IdNr).not.toBe(firstResult.IdNr);
	});
});
