import baseDb from '../bdd/cards_db.json';
import jungleDb from '../bdd/cards_ju_db.json';
import fossilDb from '../bdd/cards_foss_db.json';

function getDb(normalizedEd) {
  if (normalizedEd === 'jungle') return jungleDb;
  if (normalizedEd === 'fossil') return fossilDb;
  return baseDb;
}

function normalizeEdicion(card) {
  let edicion = card.set?.id || card.id?.split('-')[0] || '';
  if (edicion === 'base1') edicion = 'base';
  else if (edicion === 'base2') edicion = 'jungle';
  else if (edicion === 'base3') edicion = 'fossil';
  else if (edicion === 'base4') edicion = 'base2';
  else if (edicion === 'base5') edicion = 'rocket';
  return edicion;
}

export function getPrices(card) {
  if (!card) return { poor: null, played: null, lightPlayed: null, good: null, excellent: null, nearMint: null, mint: null };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkPrices = (ed) => {
    const idBase = `${ed}:first-no`;
    const db = getDb(ed);

    const conditions = {
      poor: 'po',
      played: 'pl',
      lightPlayed: 'lp',
      good: 'gd',
      excellent: 'ex',
      nearMint: 'nm',
      mint: 'mt'
    };

    const prices = {};
    let foundAny = false;

    for (const [key, condId] of Object.entries(conditions)) {
      const fullId = `${idBase}:${condId}:${number}`;
      const foundCard = db.find(c => c.id.toLowerCase() === fullId.toLowerCase());
      prices[key] = foundCard?.cheapest_offer_es || null;
      if (prices[key]) foundAny = true;
    }

    return foundAny ? prices : null;
  };

  let prices = checkPrices(edicion);
  if (!prices && edicion !== baseEdicion) {
    prices = checkPrices(baseEdicion);
  }

  return prices || { poor: null, played: null, lightPlayed: null, good: null, excellent: null, nearMint: null, mint: null };
}

export function parsePrice(priceStr) {
  if (!priceStr) return null;
  const numStr = priceStr.replace(' €', '').replace('.', '').replace(',', '.').trim();
  const val = parseFloat(numStr);
  return isNaN(val) ? null : val;
}

export function formatPrice(num) {
  if (num === null || num === undefined) return 'N/A';
  return `${num.toFixed(2).replace('.', ',')} €`;
}

export function getCardMarketUrl(card) {
  if (!card) return null;
  const edicion = normalizeEdicion(card);
  const number = card.localId;
  const baseEdicion = edicion.replace(/\d+$/, '');
  const tryEdicion = (ed) => {
    const db = getDb(ed);
    const entry = db.find(c => {
      const parts = c.id.toLowerCase().split(':');
      return parts[0] === ed.toLowerCase() && parts[3] === String(number).toLowerCase();
    });
    return entry?.url || null;
  };
  return tryEdicion(edicion) || (edicion !== baseEdicion ? tryEdicion(baseEdicion) : null) || null;
}

export const COND_IDS = ['po', 'pl', 'lp', 'gd', 'ex', 'nm', 'mt'];

export function getAllPrices(card) {
  const emptyPrices = () => Object.fromEntries(COND_IDS.map(c => [c, null]));
  if (!card) return { no: emptyPrices(), yes: emptyPrices() };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkEdition = (ed, edKey) => {
    const db = getDb(ed);
    const idBase = `${ed}:${edKey}`;
    const prices = {};
    let foundAny = false;
    for (const condId of COND_IDS) {
      const fullId = `${idBase}:${condId}:${number}`;
      const found = db.find(c => c.id.toLowerCase() === fullId.toLowerCase());
      prices[condId] = found?.cheapest_offer_es || null;
      if (prices[condId]) foundAny = true;
    }
    return foundAny ? prices : null;
  };

  const noEd = checkEdition(edicion, 'first-no') || checkEdition(baseEdicion, 'first-no') || emptyPrices();
  const yesEd = checkEdition(edicion, 'first-yes') || checkEdition(baseEdicion, 'first-yes') || emptyPrices();
  return { no: noEd, yes: yesEd };
}
