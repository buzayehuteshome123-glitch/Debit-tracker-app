/**
 * Pure business-logic functions, deliberately independent of the database and UI,
 * so the core rules (balance math, validation) can be unit-tested directly.
 */
import type { TranslationKey } from '../i18n/translations';

export function computeBalanceCents(totalDebtCents: number, totalPaymentCents: number): number {
  return totalDebtCents - totalPaymentCents;
}

export type ValidationResult = { valid: true } | { valid: false; errorKey: TranslationKey };

export function validateAmountCents(cents: number | null): ValidationResult {
  if (cents === null) return { valid: false, errorKey: 'error_invalid_amount' };
  if (cents <= 0) return { valid: false, errorKey: 'error_amount_must_be_positive' };
  return { valid: true };
}

export function validatePaymentAgainstBalance(
  paymentCents: number,
  outstandingBalanceCents: number
): ValidationResult {
  if (paymentCents > outstandingBalanceCents) {
    return { valid: false, errorKey: 'error_payment_exceeds_balance' };
  }
  return { valid: true };
}

export function validateCustomerName(name: string): ValidationResult {
  if (name.trim().length === 0) {
    return { valid: false, errorKey: 'error_customer_name_required' };
  }
  return { valid: true };
}

export function isPaidOff(balanceCents: number): boolean {
  return balanceCents <= 0;
}
