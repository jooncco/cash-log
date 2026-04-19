import { useTranslation, translations } from '../lib/i18n';

describe('i18n', () => {
  it('returns Korean translation', () => {
    const t = useTranslation('ko');
    expect(t('dashboard')).toBe('대시보드');
    expect(t('transactions')).toBe('거래내역');
  });

  it('returns English translation', () => {
    const t = useTranslation('en');
    expect(t('dashboard')).toBe('Dashboard');
    expect(t('transactions')).toBe('Transactions');
  });

  it('ko and en have the same keys', () => {
    const koKeys = Object.keys(translations.ko).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(koKeys).toEqual(enKeys);
  });
});
