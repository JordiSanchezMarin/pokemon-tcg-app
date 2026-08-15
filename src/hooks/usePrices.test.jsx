import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllPrices, getCardMarketUrl } from '../utils/price';
import { useCardPricing, useCollectionPrices } from './usePrices';

vi.mock('../utils/price', () => ({
  getAllPrices: vi.fn(),
  getCardMarketUrl: vi.fn(),
}));

const gyarados = { id: 'base1-6', localId: '6', set: { id: 'base1' } };
const pikachu = { id: 'base1-58', localId: '58', set: { id: 'base1' } };

describe('pricing hooks', () => {
  beforeEach(() => {
    getAllPrices.mockImplementation(async card => ({ cardId: card.id }));
    getCardMarketUrl.mockResolvedValue('https://example.com/card');
  });

  it('loads prices and the market URL for one card', async () => {
    const { result } = renderHook(() => useCardPricing(gyarados));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.prices).toEqual({ cardId: gyarados.id });
    expect(result.current.cardMarketUrl).toBe('https://example.com/card');
    expect(result.current.error).toBeNull();
  });

  it('loads a price map for a collection of cards', async () => {
    const { result } = renderHook(() => useCollectionPrices([gyarados, pikachu]));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pricesByCardId).toEqual({
      [gyarados.id]: { cardId: gyarados.id },
      [pikachu.id]: { cardId: pikachu.id },
    });
  });
});