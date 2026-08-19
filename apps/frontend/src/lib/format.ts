import { format } from 'date-fns';
import type { Language } from './i18n';

/** `₩13,881,900`, with the sign kept outside the currency symbol. */
export function formatFullKrw(value: number): string {
  return `${value < 0 ? '-' : ''}₩${Math.abs(value).toLocaleString('ko-KR')}`;
}

/**
 * Compact money label with thousand separators: `1,388만`, `1.4억`, `8,500`.
 * 억 keeps one decimal below 10억 so 1.5억 is not rounded away to 2억.
 */
export function formatCompactKrw(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs === 0) return '0';
  if (abs >= 100_000_000) {
    const eok = abs / 100_000_000;
    const text = eok >= 10 ? Math.round(eok).toLocaleString('ko-KR') : eok.toFixed(1).replace(/\.0$/, '');
    return `${sign}${text}억`;
  }
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만`;
  return `${sign}${abs.toLocaleString('ko-KR')}`;
}

/** Same as {@link formatCompactKrw} but always shows the sign for gains. */
export function formatSignedCompactKrw(value: number): string {
  if (value === 0) return '0';
  return `${value > 0 ? '+' : ''}${formatCompactKrw(value)}`;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('ko-KR')}%`;
}

/**
 * `2026-04` -> `4월` / `Apr`. The year is prefixed at each year boundary (and
 * on the first tick) so a multi-year range stays unambiguous without repeating
 * the year on every label.
 */
export function formatMonthTick(month: string, index: number, language: Language): string {
  if (!month) return '';
  const [year, monthNumber] = month.split('-');
  const short = format(new Date(`${month}-01`), language === 'ko' ? 'M월' : 'MMM');
  return index === 0 || monthNumber === '01' ? `${year} · ${short}` : short;
}

export function formatMonthLong(month: string, language: Language): string {
  return format(new Date(`${month}-01`), language === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy');
}
