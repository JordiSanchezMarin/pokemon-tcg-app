import baseDb from '../bdd/cards_db.json';
import jungleDb from '../bdd/cards_ju_db.json';
import fossilDb from '../bdd/cards_foss_db.json';
import teamRocketDb from '../bdd/cards_team_rocket_db.json';
import neoGenesisEsDb from '../bdd/cards_neo_genesis_db-es.json';
import neoGenesisEnDb from '../bdd/cards_neo_genesis_db-en.json';

export const LANG_NAMES = {
  en: 'Inglés',
  es: 'Español',
  ja: 'Japonés',
  ko: 'Coreano',
  none: 'Único'
};

const DATABASES = {
  base: { none: baseDb },
  jungle: { none: jungleDb },
  fossil: { none: fossilDb },
  team_rocket: { none: teamRocketDb },
  neo_genesis: { es: neoGenesisEsDb, en: neoGenesisEnDb }
};

export function getAvailableLanguages(card) {
  const edicion = normalizeEdicion(card);
  const dbs = DATABASES[edicion] || { none: baseDb };
  return Object.keys(dbs);
}

export function getCondKey(lang, edition, condition) {
  if (!lang || lang === 'none') return `${edition}:${condition}`;
  return `${lang}:${edition}:${condition}`;
}

function getDbs(normalizedEd) {
  return DATABASES[normalizedEd] || { none: baseDb };
}

function normalizeEdicion(card) {
  let edicion = card.set?.id || card.id?.split('-')[0] || '';
  if (edicion === 'base1') edicion = 'base';
  else if (edicion === 'base2') edicion = 'jungle';
  else if (edicion === 'base3') edicion = 'fossil';
  else if (edicion === 'base4') edicion = 'base2';
  else if (edicion === 'base5') edicion = 'team_rocket';
  else if (edicion === 'neo1') edicion = 'neo_genesis';
  return edicion;
}

function getOffer(c) {
  if (!c) return null;
  return c.cheapest_offer_es || c.cheapest_offer_en || c.cheapest_offer_ja || c.cheapest_offer_ko || null;
}

export function getPrices(card) {
  if (!card) return { poor: null, played: null, lightPlayed: null, good: null, excellent: null, nearMint: null, mint: null };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkPrices = (ed) => {
    const dbs = getDbs(ed);
    const conditions = {
      poor: 'po', played: 'pl', lightPlayed: 'lp',
      good: 'gd', excellent: 'ex', nearMint: 'nm', mint: 'mt'
    };

    const prices = {};
    let foundAny = false;

    // Search in the first available language dictionary
    for (const [lang, db] of Object.entries(dbs)) {
      const idBase = `${ed}:first-no`;
      for (const [key, condId] of Object.entries(conditions)) {
        if (!prices[key]) {
          const fullId = `${idBase}:${condId}:${number}`;
          const foundCard = db.find(c => c.id.toLowerCase() === fullId.toLowerCase());
          const offer = getOffer(foundCard);
          if (offer) {
            prices[key] = offer;
            foundAny = true;
          }
        }
      }
      if (foundAny) break;
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
    const dbs = getDbs(ed);
    for (const [lang, db] of Object.entries(dbs)) {
      const entry = db.find(c => {
        const parts = c.id.toLowerCase().split(':');
        return parts[0] === ed.toLowerCase() && parts[3] === String(number).toLowerCase();
      });
      if (entry?.url) return entry.url;
    }
    return null;
  };
  return tryEdicion(edicion) || (edicion !== baseEdicion ? tryEdicion(baseEdicion) : null) || null;
}

export const COND_IDS = ['po', 'pl', 'lp', 'gd', 'ex', 'nm', 'mt'];

export function getAllPrices(card) {
  const emptyPrices = () => Object.fromEntries(COND_IDS.map(c => [c, null]));
  if (!card) return { none: { no: emptyPrices(), yes: emptyPrices() } };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkEditionLang = (ed, edKey, db) => {
    const idBase = `${ed}:${edKey}`;
    const prices = {};
    let foundAny = false;
    for (const condId of COND_IDS) {
      const fullId = `${idBase}:${condId}:${number}`;
      const found = db.find(c => c.id.toLowerCase() === fullId.toLowerCase());
      prices[condId] = getOffer(found);
      if (prices[condId]) foundAny = true;
    }
    return foundAny ? prices : null;
  };

  const getLangPrices = (ed) => {
    const dbs = getDbs(ed);
    const result = {};
    for (const [lang, db] of Object.entries(dbs)) {
      const noEd = checkEditionLang(ed, 'first-no', db) || emptyPrices();
      const yesEd = checkEditionLang(ed, 'first-yes', db) || emptyPrices();
      if (Object.values(noEd).some(p => p) || Object.values(yesEd).some(p => p)) {
        result[lang] = { no: noEd, yes: yesEd };
      } else {
        result[lang] = { no: emptyPrices(), yes: emptyPrices() };
      }
    }
    return result;
  };

  const currentEdPrices = getLangPrices(edicion);
  if (Object.values(currentEdPrices).some(lang => Object.values(lang.no).some(p => p) || Object.values(lang.yes).some(p => p))) {
    return currentEdPrices;
  }

  if (edicion !== baseEdicion) {
    return getLangPrices(baseEdicion);
  }

  return currentEdPrices;
}
