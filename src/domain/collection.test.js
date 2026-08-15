import { describe, expect, it } from 'vitest';
import { addUnit, getUnitCount, removeUnit } from './collection';

const card = {
  id: 'base1-6',
  name: 'Gyarados',
  localId: '6',
  set: { id: 'base1', name: 'Base Set' },
};

describe('collection domain', () => {
  it('updates units immutably and derives totals from conditions', () => {
    const emptyCollection = {};
    const withCard = addUnit(emptyCollection, card, 'en:yes:nm');
    const withTwoUnits = addUnit(withCard, card, 'no:ex');

    expect(emptyCollection).toEqual({});
    expect(getUnitCount(withTwoUnits, card.id)).toBe(2);
    expect(withTwoUnits[card.id].count).toBeUndefined();

    const withOneUnit = removeUnit(withTwoUnits, card.id, 'en:yes:nm');
    expect(getUnitCount(withOneUnit, card.id)).toBe(1);
    expect(getUnitCount(withTwoUnits, card.id)).toBe(2);
  });

  it('removes the card when its final unit is removed', () => {
    const collection = addUnit({}, card, 'no:ex');

    expect(removeUnit(collection, card.id, 'no:ex')).toEqual({});
  });
});