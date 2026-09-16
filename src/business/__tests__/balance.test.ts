import {
  computeBalanceCents,
  isPaidOff,
  validateAmountCents,
  validateCustomerName,
  validatePaymentAgainstBalance,
} from '../balance';
import { parseAmountToCents, formatCents } from '../../money';

describe('computeBalanceCents', () => {
  test('new debt on a zero-balance customer', () => {
    // Spec 42: customer with zero balance receives 1,000 ETB debt -> balance 1,000
    expect(computeBalanceCents(100000, 0)).toBe(100000);
  });

  test('partial payment', () => {
    // Owes 1,000, pays 400 -> balance 600
    expect(computeBalanceCents(100000, 40000)).toBe(60000);
  });

  test('full payment pays off the balance', () => {
    // Owes 1,000, pays 1,000 -> balance 0, paid off
    const balance = computeBalanceCents(100000, 100000);
    expect(balance).toBe(0);
    expect(isPaidOff(balance)).toBe(true);
  });

  test('multiple debts accumulate', () => {
    const totalDebt = 100000 + 200000; // 1,000 + 2,000
    expect(totalDebt).toBe(300000);
  });

  test('multiple debts and multiple payments', () => {
    const totalDebt = 300000; // 3,000
    const totalPayments = 50000 + 100000; // 500 + 1,000
    expect(computeBalanceCents(totalDebt, totalPayments)).toBe(150000); // 1,500
  });

  test('editing a debt upward increases the balance by the delta', () => {
    const before = computeBalanceCents(100000, 0); // 1,000
    const after = computeBalanceCents(200000, 0); // edited to 2,000
    expect(after - before).toBe(100000);
  });

  test('deleting a debt decreases the balance by that amount', () => {
    const before = computeBalanceCents(300000, 0); // two debts totalling 3,000
    const afterDeletingOne = computeBalanceCents(300000 - 100000, 0);
    expect(before - afterDeletingOne).toBe(100000);
  });
});

describe('validateAmountCents', () => {
  test('rejects unparsable input', () => {
    expect(validateAmountCents(null)).toEqual({ valid: false, errorKey: 'error_invalid_amount' });
  });

  test('rejects zero', () => {
    expect(validateAmountCents(0)).toEqual({ valid: false, errorKey: 'error_amount_must_be_positive' });
  });

  test('rejects negative', () => {
    expect(validateAmountCents(-500)).toEqual({ valid: false, errorKey: 'error_amount_must_be_positive' });
  });

  test('accepts positive amount', () => {
    expect(validateAmountCents(100000)).toEqual({ valid: true });
  });
});

describe('validatePaymentAgainstBalance', () => {
  test('rejects a payment greater than the outstanding balance', () => {
    // Spec: balance 1,000, payment 1,500 -> rejected
    expect(validatePaymentAgainstBalance(150000, 100000)).toEqual({
      valid: false,
      errorKey: 'error_payment_exceeds_balance',
    });
  });

  test('accepts a payment equal to the outstanding balance', () => {
    expect(validatePaymentAgainstBalance(100000, 100000)).toEqual({ valid: true });
  });

  test('accepts a payment less than the outstanding balance', () => {
    expect(validatePaymentAgainstBalance(40000, 100000)).toEqual({ valid: true });
  });
});

describe('validateCustomerName', () => {
  test('rejects an empty name', () => {
    expect(validateCustomerName('')).toEqual({ valid: false, errorKey: 'error_customer_name_required' });
  });

  test('rejects a whitespace-only name', () => {
    expect(validateCustomerName('   ')).toEqual({ valid: false, errorKey: 'error_customer_name_required' });
  });

  test('accepts a real name', () => {
    expect(validateCustomerName('Abebe Kebede')).toEqual({ valid: true });
  });
});

describe('money parsing and formatting (integer-cents, no floating point)', () => {
  test('parses whole-number birr', () => {
    expect(parseAmountToCents('1500')).toBe(150000);
  });

  test('parses birr with cents', () => {
    expect(parseAmountToCents('1500.50')).toBe(150050);
  });

  test('parses amounts typed with thousand separators', () => {
    expect(parseAmountToCents('1,500')).toBe(150000);
  });

  test('rejects invalid input', () => {
    expect(parseAmountToCents('abc')).toBeNull();
    expect(parseAmountToCents('')).toBeNull();
    expect(parseAmountToCents('12.345')).toBeNull();
  });

  test('formats large amounts with thousand separators', () => {
    expect(formatCents(100000)).toBe('1,000 ብር');
    expect(formatCents(100000000)).toBe('1,000,000 ብር');
  });

  test('never loses precision the way floating point would', () => {
    // 0.1 + 0.2 famously != 0.3 in floating point; integer cents must not repeat that.
    const tenCents = parseAmountToCents('0.10')!;
    const twentyCents = parseAmountToCents('0.20')!;
    expect(tenCents + twentyCents).toBe(30);
    expect(formatCents(tenCents + twentyCents)).toBe('0.30 ብር');
  });
});
