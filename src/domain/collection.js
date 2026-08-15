export function createDefaultConditions() {
  return {
    'no:po': 0,
    'no:pl': 0,
    'no:lp': 0,
    'no:gd': 0,
    'no:ex': 0,
    'no:nm': 0,
    'no:mt': 0,
    'yes:po': 0,
    'yes:pl': 0,
    'yes:lp': 0,
    'yes:gd': 0,
    'yes:ex': 0,
    'yes:nm': 0,
    'yes:mt': 0,
  };
}

export function sanitizeCard(card) {
  return {
    id: card.id,
    name: card.name,
    image: card.image,
    localId: card.localId,
    rarity: card.rarity,
    set: card.set ? {
      id: card.set.id,
      name: card.set.name,
      cardCount: card.set.cardCount,
    } : null,
    types: card.types,
  };
}

export function getItemCount(item) {
  return Object.values(item?.conditions || {}).reduce((total, count) => total + count, 0);
}

export function getUnitCount(collection, cardId) {
  return getItemCount(collection[cardId]);
}

export function getConditionCount(collection, cardId, conditionKey) {
  return collection[cardId]?.conditions?.[conditionKey] || 0;
}

export function addUnit(collection, card, conditionKey) {
  const current = collection[card.id];
  const conditions = {
    ...createDefaultConditions(),
    ...current?.conditions,
  };

  return {
    ...collection,
    [card.id]: {
      cardData: sanitizeCard(card),
      conditions: {
        ...conditions,
        [conditionKey]: (conditions[conditionKey] || 0) + 1,
      },
    },
  };
}

export function removeUnit(collection, cardId, conditionKey = null) {
  const current = collection[cardId];
  if (!current) return collection;

  const conditions = {
    ...createDefaultConditions(),
    ...current.conditions,
  };
  const targetKey = conditionKey || Object.keys(conditions).find(key => conditions[key] > 0);

  if (!targetKey || (conditions[targetKey] || 0) <= 0) return collection;

  if (getItemCount(current) <= 1) {
    return deleteCard(collection, cardId);
  }

  return {
    ...collection,
    [cardId]: {
      ...current,
      conditions: {
        ...conditions,
        [targetKey]: conditions[targetKey] - 1,
      },
    },
  };
}

export function deleteCard(collection, cardId) {
  if (!collection[cardId]) return collection;

  const nextCollection = { ...collection };
  delete nextCollection[cardId];
  return nextCollection;
}