import { describe, expect, it } from 'vitest';
import {
  formatPrice,
  getAllPrices,
  getAvailableLanguages,
  getCardMarketUrl,
  getCondKey,
  parsePrice,
} from './price';

const baseSetGyarados = {
  id: 'base1-6',
  localId: '6',
  set: { id: 'base1' },
};

describe('price utilities', () => {
  it('builds condition keys with and without a language', () => {
    expect(getCondKey('es', 'yes', 'nm')).toBe('es:yes:nm');
    expect(getCondKey('none', 'no', 'ex')).toBe('no:ex');
    expect(getCondKey(undefined, 'no', 'po')).toBe('no:po');
  });

  it('parses and formats Cardmarket prices', () => {
    expect(parsePrice('1.234,56 €')).toBe(1234.56);
    expect(parsePrice('invalid')).toBeNull();
    expect(formatPrice(1234.56)).toBe('1234,56 €');
    expect(formatPrice(null)).toBe('N/A');
  });

  it('resolves languages, prices, and URL for a known card', () => {
    const prices = getAllPrices(baseSetGyarados);

    expect(getAvailableLanguages(baseSetGyarados)).toEqual(['es', 'en']);
    expect(prices.en.no.po).toBe('2,99 €');
    expect(getCardMarketUrl(baseSetGyarados)).toContain('/Base-Set/Gyarados');
  });
});