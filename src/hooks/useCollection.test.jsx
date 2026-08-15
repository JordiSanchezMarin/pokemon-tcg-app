import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import useCollection from './useCollection';

const card = {
  id: 'base1-6',
  name: 'Gyarados',
  image: 'https://example.com/gyarados',
  localId: '6',
  rarity: 'Rare Holo',
  set: { id: 'base1', name: 'Base Set', cardCount: { total: 102 } },
  types: ['Water'],
};

function createJsonFile(contents) {
  return new File([contents], 'collection.json', { type: 'application/json' });
}

describe('useCollection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds and removes units by language, edition, and condition', () => {
    const { result } = renderHook(() => useCollection());

    act(() => {
      result.current.addUnit(card, 'en', 'yes', 'nm');
      result.current.addUnit(card, 'none', 'no', 'ex');
    });

    expect(result.current.getUnitCount(card.id)).toBe(2);
    expect(result.current.getConditionCount(card.id, 'en:yes:nm')).toBe(1);
    expect(result.current.getConditionCount(card.id, 'no:ex')).toBe(1);

    act(() => result.current.removeUnit(card.id, 'en:yes:nm'));

    expect(result.current.getUnitCount(card.id)).toBe(1);
    expect(result.current.getConditionCount(card.id, 'en:yes:nm')).toBe(0);
  });

  it('loads and persists the collection in localStorage', async () => {
    const saved = {
      [card.id]: {
        cardData: card,
        count: 1,
        conditions: { 'no:ex': 1 },
      },
    };
    localStorage.setItem('pokemon-tcg-collection', JSON.stringify(saved));

    const { result } = renderHook(() => useCollection());

    expect(result.current.getUnitCount(card.id)).toBe(1);

    act(() => result.current.addUnit(card, 'none', 'no', 'ex'));

    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem('pokemon-tcg-collection'));
      expect(persisted.schemaVersion).toBe(1);
      expect(persisted.collection[card.id].count).toBeUndefined();
      expect(persisted.collection[card.id].conditions['no:ex']).toBe(2);
    });
  });

  it('imports valid JSON and rejects malformed JSON', async () => {
    const { result } = renderHook(() => useCollection());
    const imported = {
      [card.id]: {
        cardData: card,
        count: 1,
        conditions: { 'es:no:gd': 1 },
      },
    };

    await act(async () => {
      await result.current.importCollection(createJsonFile(JSON.stringify(imported)));
    });

    expect(result.current.getUnitCount(card.id)).toBe(1);
    expect(result.current.getConditionCount(card.id, 'es:no:gd')).toBe(1);
    expect(result.current.collection[card.id].count).toBeUndefined();

    await expect(
      act(async () => result.current.importCollection(createJsonFile('{invalid')))
    ).rejects.toBeInstanceOf(Error);
  });

  it('deletes all copies of a card', () => {
    const { result } = renderHook(() => useCollection());

    act(() => result.current.addUnit(card));
    act(() => result.current.deleteCard(card.id));

    expect(result.current.getUnitCount(card.id)).toBe(0);
    expect(result.current.collection[card.id]).toBeUndefined();
  });
});