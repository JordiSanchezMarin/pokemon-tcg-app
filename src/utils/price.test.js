import { describe, expect, it } from 'vitest';
import {
  formatPrice,
  getAllPrices,
  getAvailableLanguages,
  getCardMarketUrl,
  getCondKey,
  getPrices,
  parsePrice,
} from './price';

const baseSetGyarados = {
  id: 'base1-6',
  localId: '6',
  set: { id: 'base1' },
};

const baseSetTwoNidoking = {
  id: 'base4-11',
  localId: '11',
  set: { id: 'base4' },
};

const wizardsBlackStarPromoElectabuzz = {
  id: 'basep-2',
  localId: '2',
  set: { id: 'basep' },
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

  it('resolves languages, prices, and URL for a known card', async () => {
    const prices = await getAllPrices(baseSetGyarados);
    const simplePrices = await getPrices(baseSetGyarados);

    expect(getAvailableLanguages(baseSetGyarados)).toEqual(['es', 'en']);
    expect(prices.en.no.po).toBe('2,99 €');
    expect(simplePrices.poor).toBe('5,00 €');
    await expect(getCardMarketUrl(baseSetGyarados)).resolves.toContain('/Base-Set/Gyarados');
  });

  it('loads prices and URL for Base Set 2 cards', async () => {
    const prices = await getAllPrices(baseSetTwoNidoking);
    const simplePrices = await getPrices(baseSetTwoNidoking);

    expect(getAvailableLanguages(baseSetTwoNidoking)).toEqual(['es', 'en']);
    expect(prices.es.no.po).toBe('7,00 €');
    expect(simplePrices.poor).toBe('7,00 €');
    await expect(getCardMarketUrl(baseSetTwoNidoking)).resolves.toContain('/Base-Set-2/Nidoking-B211');
  });

  it('loads prices and URL for Journey Together cards', async () => {
    const journeyTogetherCard = {
      id: 'sv09-142',
      localId: '142',
      set: { id: 'sv09' },
    };

    expect(getAvailableLanguages(journeyTogetherCard)).toEqual(['es', 'en']);

    const prices = await getAllPrices(journeyTogetherCard);
    const simplePrices = await getPrices(journeyTogetherCard);

    expect(prices.en.no.nm).toBe('0,02 €');
    expect(simplePrices.nearMint).toBe('0,02 €');
    await expect(getCardMarketUrl(journeyTogetherCard)).resolves.toContain('/Journey-Together');
  });

  it('loads zero-padded Journey Together prices from unpadded local IDs', async () => {
    const journeyTogetherCard = {
      id: 'sv09-59',
      localId: '59',
      set: { id: 'sv09' },
    };

    const prices = await getAllPrices(journeyTogetherCard);
    const simplePrices = await getPrices(journeyTogetherCard);

    expect(prices.es.no.nm).toBe('0,02 €');
    expect(simplePrices.nearMint).toBe('0,02 €');
    await expect(getCardMarketUrl(journeyTogetherCard)).resolves.toContain('/Journey-Together/Shuppet-JTG059');
  });

  it('loads prices and URL for Wizards Black Star Promos cards', async () => {
    expect(getAvailableLanguages(wizardsBlackStarPromoElectabuzz)).toEqual(['es', 'en']);

    const prices = await getAllPrices(wizardsBlackStarPromoElectabuzz);
    const simplePrices = await getPrices(wizardsBlackStarPromoElectabuzz);

    expect(prices.es.no.po).toBe('0,50 €');
    expect(simplePrices.poor).toBe('0,50 €');
    await expect(getCardMarketUrl(wizardsBlackStarPromoElectabuzz)).resolves.toContain('/Wizards-Black-Star-Promos');
  });
});