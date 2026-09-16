/**
 * All money is stored/manipulated as integer "cents" (1/100 of a Birr) to avoid
 * floating-point rounding errors. Only format to a display string at the edge.
 */

export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [wholePart, fractionPartRaw] = cleaned.split('.');
  const fractionPart = (fractionPartRaw ?? '').padEnd(2, '0');

  const whole = parseInt(wholePart, 10);
  const fraction = parseInt(fractionPart, 10);
  if (Number.isNaN(whole) || Number.isNaN(fraction)) return null;

  return whole * 100 + fraction;
}

function groupThousands(digits: string): string {
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    const posFromEnd = digits.length - i;
    result += digits[i];
    if (posFromEnd > 1 && posFromEnd % 3 === 1) {
      result += ',';
    }
  }
  return result;
}

/** Formats integer cents as "1,500" (no currency suffix), or "1,500.50" with a fractional remainder. */
export function formatCentsPlain(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absCents = Math.abs(Math.round(cents));
  const whole = Math.floor(absCents / 100);
  const fraction = absCents % 100;

  const wholeStr = groupThousands(String(whole));
  return fraction === 0 ? `${sign}${wholeStr}` : `${sign}${wholeStr}.${String(fraction).padStart(2, '0')}`;
}

/** Formats integer cents as "1,500 ብር" (or "1,500.50 ብር" when there's a fractional remainder). */
export function formatCents(cents: number, currencySuffix = 'ብር'): string {
  return `${formatCentsPlain(cents)} ${currencySuffix}`;
}

export function addCents(...values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}
