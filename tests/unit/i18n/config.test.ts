import { DEFAULT_LOCALE, LOCALES, isLocale, negotiateLocale } from '@/i18n/config';
import en from '../../../messages/en.json';
import hi from '../../../messages/hi.json';

describe('isLocale', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('hi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('negotiateLocale', () => {
  it('falls back to the default when the header is absent', () => {
    expect(negotiateLocale(null)).toBe(DEFAULT_LOCALE);
  });

  it('picks a supported locale from the header', () => {
    expect(negotiateLocale('hi-IN,hi;q=0.9,en;q=0.8')).toBe('hi');
  });

  it('respects quality ordering rather than header order', () => {
    expect(negotiateLocale('hi;q=0.2,en;q=0.9')).toBe('en');
  });

  it('skips unsupported locales', () => {
    expect(negotiateLocale('fr-FR,de;q=0.9,hi;q=0.5')).toBe('hi');
  });

  it('falls back when nothing matches', () => {
    expect(negotiateLocale('fr-FR,de;q=0.9')).toBe(DEFAULT_LOCALE);
  });
});

/**
 * Guards the strict localisation policy: every locale must define every key, so
 * adding a string in English without translating it fails the build.
 */
describe('message catalogues', () => {
  const catalogues: Record<string, unknown> = { en, hi };

  function leafKeys(value: unknown, prefix = ''): string[] {
    if (value === null || typeof value !== 'object') return [prefix];
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !key.startsWith('_'))
      .flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key));
  }

  const reference = leafKeys(en).sort();

  it.each(LOCALES)('%s defines exactly the same keys as en', (locale) => {
    const keys = leafKeys(catalogues[locale]).sort();
    expect(keys).toEqual(reference);
  });
});
