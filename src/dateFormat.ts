import type { Locale } from './types';

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Gregorian month names rendered in Amharic script. Full Ethiopian-calendar
// conversion is intentionally not implemented (see spec section 26) to avoid
// mixing two calendar systems internally.
const MONTHS_AM = [
  'ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር',
];

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIsoDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const months = locale === 'am' ? MONTHS_AM : MONTHS_EN;
  return `${months[month - 1]} ${day}, ${year}`;
}

export function formatTimeFromIso(isoTimestamp: string, locale: Locale): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(locale === 'am' ? 'am-ET' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isToday(isoDate: string): boolean {
  return isoDate === toIsoDate(new Date());
}
