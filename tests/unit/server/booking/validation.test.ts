// tests/unit/server/booking/validation.test.ts
// Unit tests for booking validation logic

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock account-rules module BEFORE importing it
vi.mock('../../../../src/lib/server/booking/account-rules.js', () => ({
	assertAccountAllowed: vi.fn()
}));

import { validateBookingAccounts, type BookingPayload } from '../../../../src/lib/server/booking/validation.js';
import * as accountRules from '../../../../src/lib/server/booking/account-rules.js';

describe('validateBookingAccounts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock to default implementation (do nothing)
		vi.mocked(accountRules.assertAccountAllowed).mockImplementation(() => {});
	});

	describe('BookCircle validation', () => {
		it('should throw error if BookCircle is missing', () => {
			expect(() => {
				validateBookingAccounts({});
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is null', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: null as any });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is undefined', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: undefined });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is empty string', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: '' });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is 0', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: 0 });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is negative', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: -1 });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should throw error if BookCircle is NaN', () => {
			expect(() => {
				validateBookingAccounts({ BookCircle: NaN });
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});

		it('should accept valid BookCircle as number', () => {
			const result = validateBookingAccounts({ BookCircle: 10 });
			expect(result).toBe(true);
		});

		it('should accept valid BookCircle as string', () => {
			const result = validateBookingAccounts({ BookCircle: '10' });
			expect(result).toBe(true);
		});

		it('should accept bookCircle (lowercase) property', () => {
			const result = validateBookingAccounts({ bookCircle: 10 });
			expect(result).toBe(true);
		});

		it('should accept no property (legacy)', () => {
			const result = validateBookingAccounts({ no: 10 });
			expect(result).toBe(true);
		});

		it('should accept companyCode property (legacy)', () => {
			const result = validateBookingAccounts({ companyCode: 10 });
			expect(result).toBe(true);
		});

		it('should prioritize BookCircle over other properties', () => {
			const result = validateBookingAccounts({
				BookCircle: 10,
				bookCircle: 20,
				no: 30,
				companyCode: 40
			});
			expect(result).toBe(true);
			// Should use BookCircle = 10
		});
	});

	describe('Account validation', () => {
		it('should call assertAccountAllowed for account field', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: 1000
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'HK',
				account: 1000,
				field: 'account'
			});
		});

		it('should not validate account if null', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: null
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should not validate account if undefined', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: undefined
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should not validate account if empty string', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: ''
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should accept account as string', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: '1000'
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'HK',
				account: '1000',
				field: 'account'
			});
		});

		it('should propagate assertAccountAllowed errors for account', () => {
			vi.mocked(accountRules.assertAccountAllowed).mockImplementation(() => {
				throw new Error('ACCOUNT_NOT_PERMITTED:HK:account:9999');
			});

			expect(() => {
				validateBookingAccounts({
					BookCircle: 10,
					account: 9999
				});
			}).toThrow('ACCOUNT_NOT_PERMITTED:HK:account:9999');
		});
	});

	describe('Contra account validation', () => {
		it('should call assertAccountAllowed for contra field', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: 2000
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'CK',
				account: 2000,
				field: 'contra'
			});
		});

		it('should not validate contra if null', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: null
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should not validate contra if undefined', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: undefined
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should not validate contra if empty string', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: ''
			});

			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});

		it('should accept contra as string', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: '2000'
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'CK',
				account: '2000',
				field: 'contra'
			});
		});

		it('should propagate assertAccountAllowed errors for contra', () => {
			vi.mocked(accountRules.assertAccountAllowed).mockImplementation(() => {
				throw new Error('ACCOUNT_NOT_PERMITTED:CK:contra:9999');
			});

			expect(() => {
				validateBookingAccounts({
					BookCircle: 10,
					contra: 9999
				});
			}).toThrow('ACCOUNT_NOT_PERMITTED:CK:contra:9999');
		});
	});

	describe('Combined validation', () => {
		it('should validate both account and contra', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: 1000,
				contra: 2000
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledTimes(2);
			expect(accountRules.assertAccountAllowed).toHaveBeenNthCalledWith(1, {
				bookCircle: 10,
				side: 'HK',
				account: 1000,
				field: 'account'
			});
			expect(accountRules.assertAccountAllowed).toHaveBeenNthCalledWith(2, {
				bookCircle: 10,
				side: 'CK',
				account: 2000,
				field: 'contra'
			});
		});

		it('should return true if all validations pass', () => {
			const result = validateBookingAccounts({
				BookCircle: 10,
				account: 1000,
				contra: 2000
			});

			expect(result).toBe(true);
		});

		it('should work with minimal valid payload', () => {
			const result = validateBookingAccounts({ BookCircle: 10 });
			expect(result).toBe(true);
			expect(accountRules.assertAccountAllowed).not.toHaveBeenCalled();
		});
	});

	describe('Edge cases', () => {
		it('should handle account = 0 (valid account number)', () => {
			validateBookingAccounts({
				BookCircle: 10,
				account: 0
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'HK',
				account: 0,
				field: 'account'
			});
		});

		it('should handle contra = 0 (valid account number)', () => {
			validateBookingAccounts({
				BookCircle: 10,
				contra: 0
			});

			expect(accountRules.assertAccountAllowed).toHaveBeenCalledWith({
				bookCircle: 10,
				side: 'CK',
				account: 0,
				field: 'contra'
			});
		});

		it('should handle empty payload gracefully', () => {
			expect(() => {
				validateBookingAccounts();
			}).toThrow('BOOK_CIRCLE_REQUIRED');
		});
	});
});
