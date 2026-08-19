import {
  formatCompactKrw,
  formatFullKrw,
  formatMonthLong,
  formatMonthTick,
  formatPercent,
  formatSignedCompactKrw,
} from '../lib/format';

describe('formatFullKrw', () => {
  it('groups thousands and keeps the sign outside the symbol', () => {
    expect(formatFullKrw(13881900)).toBe('₩13,881,900');
    expect(formatFullKrw(-1372010)).toBe('-₩1,372,010');
    expect(formatFullKrw(0)).toBe('₩0');
  });
});

describe('formatCompactKrw', () => {
  it('separates thousands inside 만 units', () => {
    expect(formatCompactKrw(13881900)).toBe('1,388만');
    expect(formatCompactKrw(150000)).toBe('15만');
  });

  it('keeps one decimal for 억 so 1.5억 is not rounded to 2억', () => {
    expect(formatCompactKrw(150000000)).toBe('1.5억');
    expect(formatCompactKrw(100000000)).toBe('1억');
    expect(formatCompactKrw(1250000000)).toBe('13억');
  });

  it('falls back to plain numbers below 만 and handles zero and negatives', () => {
    expect(formatCompactKrw(8500)).toBe('8,500');
    expect(formatCompactKrw(0)).toBe('0');
    expect(formatCompactKrw(-2916371)).toBe('-292만');
  });
});

describe('formatSignedCompactKrw', () => {
  it('always shows the sign except for zero', () => {
    expect(formatSignedCompactKrw(11210000)).toBe('+1,121만');
    expect(formatSignedCompactKrw(-3325090)).toBe('-333만');
    expect(formatSignedCompactKrw(0)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('rounds to one decimal and signs gains', () => {
    expect(formatPercent(14.84)).toBe('+14.8%');
    expect(formatPercent(-8.25)).toBe('-8.2%');
    expect(formatPercent(0)).toBe('0%');
  });
});

describe('formatMonthTick', () => {
  it('prefixes the year on the first tick and at year boundaries only', () => {
    expect(formatMonthTick('2026-03', 0, 'ko')).toBe('2026 · 3월');
    expect(formatMonthTick('2026-04', 1, 'ko')).toBe('4월');
    expect(formatMonthTick('2027-01', 10, 'ko')).toBe('2027 · 1월');
    expect(formatMonthTick('2026-04', 1, 'en')).toBe('Apr');
  });

  it('returns an empty string for a missing label', () => {
    expect(formatMonthTick('', 3, 'ko')).toBe('');
  });
});

describe('formatMonthLong', () => {
  it('localises the tooltip title', () => {
    expect(formatMonthLong('2026-04', 'ko')).toBe('2026년 4월');
    expect(formatMonthLong('2026-04', 'en')).toBe('April 2026');
  });
});
