import { z } from 'zod';
import { createDefaultConditions, getItemCount } from '../domain/collection';

export const COLLECTION_SCHEMA_VERSION = 1;
export const COLLECTION_STORAGE_KEY = 'pokemon-tcg-collection';

const cardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().nullable().optional(),
  localId: z.union([z.string(), z.number()]),
  rarity: z.string().nullable().optional(),
  set: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    cardCount: z.unknown().optional(),
  }).nullable().optional(),
  types: z.array(z.string()).optional(),
}).passthrough();

const collectionItemSchema = z.object({
  cardData: cardSchema,
  conditions: z.record(z.string(), z.number().int().nonnegative()),
  count: z.number().int().nonnegative().optional(),
});

const collectionSchema = z.record(z.string(), collectionItemSchema);
const envelopeSchema = z.object({
  schemaVersion: z.literal(COLLECTION_SCHEMA_VERSION),
  collection: collectionSchema,
});

function normalizeCollection(collection) {
  return Object.fromEntries(Object.entries(collection).map(([cardId, item]) => {
    const conditions = {
      ...createDefaultConditions(),
      ...item.conditions,
    };

    if (getItemCount({ conditions }) === 0 && item.count > 0) {
      conditions['no:ex'] = item.count;
    }

    return [cardId, {
      cardData: item.cardData,
      conditions,
    }];
  }));
}

export function parseCollectionData(data) {
  const isVersioned = data !== null
    && typeof data === 'object'
    && !Array.isArray(data)
    && 'schemaVersion' in data;

  if (isVersioned && data.schemaVersion !== COLLECTION_SCHEMA_VERSION) {
    throw new Error(`Versión de colección no compatible: ${data.schemaVersion}`);
  }

  const collection = isVersioned
    ? envelopeSchema.parse(data).collection
    : collectionSchema.parse(data);

  return normalizeCollection(collection);
}

export function parseCollectionJson(json) {
  return parseCollectionData(JSON.parse(json));
}

export function serializeCollection(collection) {
  return JSON.stringify({
    schemaVersion: COLLECTION_SCHEMA_VERSION,
    collection,
  });
}

export function loadCollection(storage = localStorage) {
  const saved = storage.getItem(COLLECTION_STORAGE_KEY);
  return saved ? parseCollectionJson(saved) : {};
}

export function saveCollection(collection, storage = localStorage) {
  storage.setItem(COLLECTION_STORAGE_KEY, serializeCollection(collection));
}