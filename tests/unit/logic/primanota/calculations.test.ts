// tests/unit/logic/primanota/calculations.test.ts
// Unit tests for balance calculation logic

import { describe, it, expect } from 'vitest';
import { calculateBalanceForRows, type CalculationRow } from '../../../../src/lib/logic/primanota/calculations.js';

describe('calculateBalanceForRows', () => {
	it('should return rows unchanged if viewMode is not "account"', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 100, SumHaben: 50 },
			{ SumSoll: 200, SumHaben: 75 }
		];

		const result = calculateBalanceForRows(rows, 'primanota');

		expect(result).toEqual(rows);
		expect(result[0].Balance).toBeUndefined();
		expect(result[1].Balance).toBeUndefined();
	});

	it('should return empty array if no rows provided', () => {
		const result = calculateBalanceForRows([], 'account');
		expect(result).toEqual([]);
	});

	it('should calculate running balance correctly for account view', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 100, SumHaben: 50 },
			{ SumSoll: 200, SumHaben: 75 },
			{ SumSoll: 150, SumHaben: 100 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		// Balance = previous + SumSoll - SumHaben
		expect(result[0].Balance).toBe(50.0); // 0 + 100 - 50
		expect(result[1].Balance).toBe(175.0); // 50 + 200 - 75
		expect(result[2].Balance).toBe(225.0); // 175 + 150 - 100
	});

	it('should handle missing SumSoll values (treat as 0)', () => {
		const rows: CalculationRow[] = [
			{ SumHaben: 50 },
			{ SumSoll: 100, SumHaben: 25 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(-50.0); // 0 + 0 - 50
		expect(result[1].Balance).toBe(25.0); // -50 + 100 - 25
	});

	it('should handle missing SumHaben values (treat as 0)', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 100 },
			{ SumSoll: 50, SumHaben: 25 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(100.0); // 0 + 100 - 0
		expect(result[1].Balance).toBe(125.0); // 100 + 50 - 25
	});

	it('should handle negative balances correctly', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 50, SumHaben: 100 },
			{ SumSoll: 25, SumHaben: 75 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(-50.0); // 0 + 50 - 100
		expect(result[1].Balance).toBe(-100.0); // -50 + 25 - 75
	});

	it('should use Decimal.js for precise calculations', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 0.1, SumHaben: 0.2 },
			{ SumSoll: 0.3, SumHaben: 0.0 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		// Avoid floating point errors
		expect(result[0].Balance).toBe(-0.1); // 0 + 0.1 - 0.2
		expect(result[1].Balance).toBe(0.2); // -0.1 + 0.3 - 0
	});

	it('should round balance to 2 decimal places', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 10.555, SumHaben: 5.111 },
			{ SumSoll: 3.333, SumHaben: 1.111 }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(5.44); // Rounded to 2 decimals
		expect(result[1].Balance).toBe(7.67); // 5.44 + 3.33 - 1.11 = 7.67 (correct rounding)
	});

	it('should preserve other row properties', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: 100, SumHaben: 50, IdNr: 1, BelNr: 'TEST-001' },
			{ SumSoll: 200, SumHaben: 75, IdNr: 2, BelNr: 'TEST-002' }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].IdNr).toBe(1);
		expect(result[0].BelNr).toBe('TEST-001');
		expect(result[1].IdNr).toBe(2);
		expect(result[1].BelNr).toBe('TEST-002');
	});

	it('should handle NaN values as 0', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: NaN, SumHaben: 50 },
			{ SumSoll: 100, SumHaben: NaN }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(-50.0); // 0 + 0 - 50
		expect(result[1].Balance).toBe(50.0); // -50 + 100 - 0
	});

	it('should handle Infinity values as 0', () => {
		const rows: CalculationRow[] = [
			{ SumSoll: Infinity, SumHaben: 50 },
			{ SumSoll: 100, SumHaben: -Infinity }
		];

		const result = calculateBalanceForRows(rows, 'account');

		expect(result[0].Balance).toBe(-50.0); // 0 + 0 - 50
		expect(result[1].Balance).toBe(50.0); // -50 + 100 - 0
	});
});
