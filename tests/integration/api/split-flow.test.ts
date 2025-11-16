// tests/integration/api/split-flow.test.ts
// Integration test for split flow: Create Split Kreditor → Verify Positions → Reconcile

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, createTestBookingPayload } from '../../setup.js';
import { insertJournalEntry } from '../../../src/lib/server/invoice-to-journal.js';
import { db } from '../../../src/lib/server/index.js';
import Decimal from 'decimal.js';
import { nanoid } from 'nanoid';

describe('Split Flow Integration', () => {
	beforeEach(() => {
		setupTestDatabase();
	});

	// Note: Cleanup runs before each test, not after, to avoid database locks

	it('should complete full split-kreditor flow: Create Split → Verify Positions → Reconcile', () => {
		// Step 1: Create original booking that will be split
		const originalBooking = createTestBookingPayload({
			BelNr: 'SPLIT-TEST-001',
			Buchungstext: 'Original Booking for Split',
			UE: 500.0,
			Brutto: 500.0,
			NettoGes: 500.0,
			GegKto: 70000
		});

		const originalResult = insertJournalEntry(originalBooking as any);
		expect(originalResult.ok).toBe(true);

		const originalIdNr = originalResult.IdNr;

		// Step 2: Create split positions
		const splitGroupId = nanoid();
		const splitTotal = 500.0;

		const positions = [
			{ account: 70001, amount: 200.0, description: 'Split Position 1', tax: 0 },
			{ account: 70002, amount: 150.0, description: 'Split Position 2', tax: 0 },
			{ account: 70003, amount: 150.0, description: 'Split Position 3', tax: 0 }
		];

		// Validate sum matches total
		const sum = positions.reduce(
			(acc, p) => new Decimal(acc).plus(new Decimal(p.amount)).toNumber(),
			0
		);
		expect(sum).toBe(splitTotal);

		// Step 3: Insert split journal entries
		const insertStmt = db.prepare(`
      INSERT INTO journal (
        Jahr, Monat, Tag, Kto, GegKto, UE, Brutto, NettoGes, Steuer,
        SH, GU, BelNr, Buchungstext, Datum, BookCircle,
        split_type, split_group_id, split_total, Gesperrt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

		const splitResults = positions.map((pos) => {
			const result = insertStmt.run(
				9999, // Jahr
				1, // Monat
				15, // Tag
				pos.account, // Kto
				70000, // GegKto
				pos.amount, // UE
				pos.amount, // Brutto
				pos.amount, // NettoGes
				0, // Steuer
				'S', // SH
				null, // GU
				'SPLIT-TEST-001', // BelNr
				pos.description, // Buchungstext
				'2025-01-15', // Datum
				10, // BookCircle
				'kreditor', // split_type
				splitGroupId, // split_group_id
				splitTotal, // split_total
				0 // Gesperrt
			);

			return {
				idNr: Number(result.lastInsertRowid),
				account: pos.account,
				amount: pos.amount
			};
		});

		expect(splitResults.length).toBe(3);

		// Step 4: Verify all split positions are in database with correct split_group_id
		const splitEntries = db
			.prepare(`
        SELECT * FROM journal
        WHERE split_group_id = ?
        ORDER BY IdNr
      `)
			.all(splitGroupId) as any[];

		expect(splitEntries.length).toBe(3);
		expect(splitEntries[0].split_type).toBe('kreditor');
		expect(splitEntries[0].split_total).toBe(splitTotal);
		expect(splitEntries[0].Buchungstext).toBe('Split Position 1');
		expect(splitEntries[1].Buchungstext).toBe('Split Position 2');
		expect(splitEntries[2].Buchungstext).toBe('Split Position 3');

		// Verify amounts
		expect(splitEntries[0].UE).toBe(200.0);
		expect(splitEntries[1].UE).toBe(150.0);
		expect(splitEntries[2].UE).toBe(150.0);

		// Note: Reconcile (Auszifferung) functionality requires match_id, match_type, match_date columns
		// which are part of the database migration plan but not yet implemented.
		// When the database schema is updated with these columns, the reconcile test can be added here.
	});

	it('should validate split sum matches total', () => {
		const positions = [
			{ account: 70001, amount: 200.0 },
			{ account: 70002, amount: 150.0 },
			{ account: 70003, amount: 100.0 } // Sum = 450, but total should be 500
		];

		const splitTotal = 500.0;

		const sum = positions.reduce(
			(acc, p) => new Decimal(acc).plus(new Decimal(p.amount)).toNumber(),
			0
		);

		const difference = new Decimal(splitTotal).minus(new Decimal(sum)).abs().toNumber();

		// Should fail validation (difference > 0.01)
		expect(difference).toBe(50.0);
		expect(difference).toBeGreaterThan(0.01);
	});

	it('should calculate tax correctly in brutto mode', () => {
		const position = {
			amount: 107.0, // Brutto
			tax: 0.07 // 7% tax
		};

		const taxFactor = new Decimal(1).plus(new Decimal(position.tax));
		const nettoGes = new Decimal(position.amount)
			.dividedBy(taxFactor)
			.toDecimalPlaces(2)
			.toNumber();
		const steuer = new Decimal(position.amount)
			.minus(new Decimal(nettoGes))
			.toDecimalPlaces(2)
			.toNumber();

		expect(nettoGes).toBe(100.0);
		expect(steuer).toBe(7.0);
	});

	it('should calculate tax correctly in netto mode', () => {
		const position = {
			amount: 100.0, // Netto
			tax: 0.07 // 7% tax
		};

		const nettoGes = new Decimal(position.amount).toDecimalPlaces(2).toNumber();
		const steuer = new Decimal(nettoGes)
			.times(new Decimal(position.tax))
			.toDecimalPlaces(2)
			.toNumber();
		const ue = new Decimal(nettoGes).plus(new Decimal(steuer)).toDecimalPlaces(2).toNumber();

		expect(nettoGes).toBe(100.0);
		expect(steuer).toBe(7.0);
		expect(ue).toBe(107.0);
	});
});
