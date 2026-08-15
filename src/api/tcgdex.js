import TCGdex, { Query } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

export function listSets() {
  return tcgdex.set.list();
}

export function getSet(setId) {
  return tcgdex.set.get(setId);
}

export function getCard(cardId) {
  return tcgdex.card.get(cardId);
}

export function searchCards({ setName, pokemonName, localId, page, itemsPerPage }) {
  const query = Query.create();

  if (pokemonName) query.contains('name', pokemonName);
  if (setName) query.equal('set.id', setName);
  if (localId) query.equal('localId', localId);

  query.paginate(page, itemsPerPage);
  return tcgdex.card.list(query);
}