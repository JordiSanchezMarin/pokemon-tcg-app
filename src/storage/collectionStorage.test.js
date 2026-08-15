import { describe, expect, it } from 'vitest';
import {
  COLLECTION_SCHEMA_VERSION,
  parseCollectionData,
  parseCollectionJson,
  serializeCollection,
} from './collectionStorage';

const legacyItem = {
  cardData: {
    id: 'base1-6',
    name: 'Gyarados',
    localId: '6',
  },
  count: 2,
  conditions: {},
};

describe('collection storage', () => {
  it('migrates an unversioned collection and reconciles its legacy count', () => {
    const collection = parseCollectionData({ 'base1-6': legacyItem });

    expect(collection['base1-6'].count).toBeUndefined();
    expect(collection['base1-6'].conditions['no:ex']).toBe(2);
  });

  it('serializes and parses the current version envelope', () => {
    const collection = parseCollectionData({ 'base1-6': legacyItem });
    const serialized = serializeCollection(collection);
    const payload = JSON.parse(serialized);

    expect(payload.schemaVersion).toBe(COLLECTION_SCHEMA_VERSION);
    expect(parseCollectionJson(serialized)).toEqual(collection);
  });

  it('rejects unsupported versions and invalid collection items', () => {
    expect(() => parseCollectionData({
      schemaVersion: COLLECTION_SCHEMA_VERSION + 1,
      collection: {},
    })).toThrow('Versión de colección no compatible');

    expect(() => parseCollectionData({ broken: { conditions: {} } })).toThrow();
  });
});