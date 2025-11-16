// tests/setup.ts
// Test setup and utilities for integration tests

import { db } from '../src/lib/server/index.js';

/**
 * Clean up test data from database
 * Removes all journal entries with Jahr = 9999 (test year)
 */
export function cleanupTestData(): void {
	try {
		// Use WAL mode to avoid locks
		db.pragma('journal_mode = WAL');
		// Set busy timeout to 30 seconds
		db.pragma('busy_timeout = 30000');

		// Delete in correct order to avoid foreign key issues
		db.prepare('DELETE FROM invoice_db WHERE id_invoice IN (SELECT id_invoice FROM invoice WHERE year = 9999)').run();
		db.prepare('DELETE FROM invoice WHERE year = 9999').run();
		db.prepare('DELETE FROM estimate WHERE year = 9999').run();
		db.prepare('DELETE FROM journal WHERE Jahr = 9999').run();

		// Clean up test debtors/creditors if any were created
		db.prepare('DELETE FROM debtors WHERE account >= 10500 AND account < 10600').run();
		db.prepare('DELETE FROM rates WHERE service = ?').run('Test Service');
	} catch (error) {
		console.error('Cleanup error:', error);
	}
}

/**
 * Setup test database state
 * Ensures test environment is clean before each test
 */
export function setupTestDatabase(): void {
	cleanupTestData();
}

/**
 * Teardown test database state
 * Cleans up after tests complete
 */
export function teardownTestDatabase(): void {
	cleanupTestData();
}

/**
 * Creates a minimal valid booking payload for testing
 */
export function createTestBookingPayload(overrides: Record<string, unknown> = {}) {
	return {
		Jahr: 9999,
		Monat: 1,
		Tag: 15,
		Kto: 10000,
		GegKto: 70000,
		Brutto: 100.0,
		NettoGes: 100.0,
		Steuer: 0,
		VStUSt: 0,
		SH: 'S',
		GU: null,
		BelNr: 'TEST-001',
		Buchungstext: 'Test Booking',
		Datum: '2025-01-15',
		Fälligkeit: null,
		id_invoice: null,
		Gesperrt: 0,
		Warnung: null,
		BL: null,
		UE: 100.0,
		BU: 0,
		AusziffNr: null,
		AusziffArt: null,
		JAGegKtoBereich: null,
		JAGegKtoPosArt: null,
		BookCircle: 10,
		JAKtoBereich: null,
		JAKtoPosArt: null,
		SBrutto: 100.0,
		HBrutto: null,
		SNetto: 100.0,
		HNetto: null,
		SVSTUSt: null,
		HVSTUSt: null,
		SteuerKto: null,
		JASteuer: null,
		JAPosSteuer: null,
		Sammelkto: 70000,
		OPVortragGegKto: 70001,
		SachVortragKto: 9000,
		...overrides
	};
}
