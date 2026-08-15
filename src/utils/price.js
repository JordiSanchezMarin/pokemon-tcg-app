export const LANG_NAMES = {
  en: 'Inglés',
  es: 'Español',
  ja: 'Japonés',
  ko: 'Coreano',
  none: 'Único'
};

const DATABASE_LOADERS = {
  base: {
    es: () => import('../bdd/cards_db.json'),
    en: () => import('../bdd/cards_base_set_db-en.json'),
  },
  jungle: { none: () => import('../bdd/cards_ju_db.json') },
  fossil: { none: () => import('../bdd/cards_foss_db.json') },
  team_rocket: { none: () => import('../bdd/cards_team_rocket_db.json') },
  neo_genesis: {
    es: () => import('../bdd/cards_neo_genesis_db-es.json'),
    en: () => import('../bdd/cards_neo_genesis_db-en.json'),
  },
  neo_discovery: { none: () => import('../bdd/cards_neo_discovery_db-en.json') },
  ascended_heroes: {
    en: () => import('../bdd/cards_ascended_heroes_db-en.json'),
    es: () => import('../bdd/cards_ascended_heroes_db-es.json'),
  },
  phantasmal_flames: {
    es: () => import('../bdd/cards_phantasmal_flames_db-es.json'),
    en: () => import('../bdd/cards_phantasmal_flames_db-en.json'),
  },
  151: {
    es: () => import('../bdd/cards_151_db-es.json'),
    en: () => import('../bdd/cards_151_db-en.json'),
  },
  destined_rivals: {
    es: () => import('../bdd/cards_destined_rivals_db-es.json'),
    en: () => import('../bdd/cards_destined_rivals_db-en.json'),
  },
  obsidian_flames: {
    es: () => import('../bdd/cards_obsidian_flames_db-es.json'),
    en: () => import('../bdd/cards_obsidian_flames_db-en.json'),
  },
  evolving_skies: {
    es: () => import('../bdd/cards_evolving_skies_db-es.json'),
    en: () => import('../bdd/cards_evolving_skies_db-es.json'),
  },
  pitch_black: {
    es: () => import('../bdd/cards_pitch_black_db-es.json'),
    en: () => import('../bdd/cards_pitch_black_db-en.json'),
  },
};

const databaseCache = new Map();

function indexDatabase(cards) {
  const byId = new Map();
  const byNumber = new Map();

  cards.forEach(card => {
    const normalizedId = card.id.toLowerCase();
    const number = normalizedId.split(':')[3];

    byId.set(normalizedId, card);
    if (number && !byNumber.has(number)) {
      byNumber.set(number, card);
    }
  });

  return {
    prefix: cards[0]?.id.split(':')[0] || '',
    byId,
    byNumber,
  };
}

function loadDatabase(edition, lang, loader) {
  const cacheKey = `${edition}:${lang}`;
  if (!databaseCache.has(cacheKey)) {
    databaseCache.set(cacheKey, loader().then(module => indexDatabase(module.default)));
  }
  return databaseCache.get(cacheKey);
}

export function getAvailableLanguages(card) {
  const edicion = normalizeEdicion(card);
  return Object.keys(DATABASE_LOADERS[edicion] || { none: null });
}

export function getCondKey(lang, edition, condition) {
  if (!lang || lang === 'none') return `${edition}:${condition}`;
  return `${lang}:${edition}:${condition}`;
}

async function getDbs(normalizedEd) {
  const loaders = DATABASE_LOADERS[normalizedEd];
  if (!loaders) return undefined;

  const entries = await Promise.all(
    Object.entries(loaders).map(async ([lang, loader]) => [
      lang,
      await loadDatabase(normalizedEd, lang, loader),
    ])
  );
  return Object.fromEntries(entries);
}

function normalizeEdicion(card) {
  let edicion = card.set?.id || card.id?.split('-')[0] || '';
  if (edicion === 'base1') edicion = 'base';
  else if (edicion === 'base2') edicion = 'jungle';
  else if (edicion === 'base3') edicion = 'fossil';
  else if (edicion === 'base4') edicion = 'base2';
  else if (edicion === 'base5') edicion = 'team_rocket';
  else if (edicion === 'neo1') edicion = 'neo_genesis';
  else if (edicion === 'neo2') edicion = 'neo_discovery';
  else if (edicion === 'me02') edicion = 'phantasmal_flames';
  else if (edicion === 'me02.5') edicion = 'ascended_heroes';
  else if (edicion === 'sv03') edicion = 'obsidian_flames';
  else if (edicion === 'sv03.5') edicion = '151';
  else if (edicion === 'sv10') edicion = 'destined_rivals';
  else if (edicion === 'me05') edicion = 'pitch_black';
  return edicion;
}

function getOffer(c) {
  if (!c) return null;
  return c.cheapest_offer_es || c.cheapest_offer_en || c.cheapest_offer_ja || c.cheapest_offer_ko || null;
}

export async function getPrices(card) {
  if (!card) return { poor: null, played: null, lightPlayed: null, good: null, excellent: null, nearMint: null, mint: null };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkPrices = async (ed) => {
    const dbs = await getDbs(ed);
    const conditions = {
      poor: 'po', played: 'pl', lightPlayed: 'lp',
      good: 'gd', excellent: 'ex', nearMint: 'nm', mint: 'mt'
    };

    const prices = {};
    let foundAny = false;

    // Search in the first available language dictionary
    if (dbs) {
      for (const database of Object.values(dbs)) {
        if (!database || database.byId.size === 0) continue;
        const idBase = `${database.prefix}:first-no`;
        for (const [key, condId] of Object.entries(conditions)) {
          if (!prices[key]) {
            const fullId = `${idBase}:${condId}:${number}`.toLowerCase();
            const foundCard = database.byId.get(fullId);
            const offer = getOffer(foundCard);
            if (offer) {
              prices[key] = offer;
              foundAny = true;
            }
          }
        }
        if (foundAny) break;
      }
    }

    return foundAny ? prices : null;
  };

  let prices = await checkPrices(edicion);
  if (!prices && edicion !== baseEdicion) {
    prices = await checkPrices(baseEdicion);
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

export async function getCardMarketUrl(card) {
  if (!card) return null;
  const edicion = normalizeEdicion(card);
  const number = card.localId;
  const baseEdicion = edicion.replace(/\d+$/, '');
  const tryEdicion = async (ed) => {
    const dbs = await getDbs(ed);
    if(!dbs) return null;
    for (const database of Object.values(dbs)) {
      if (!database || database.byNumber.size === 0) continue;
      const entry = database.byNumber.get(String(number).toLowerCase());
      if (entry?.url) return entry.url;
    }
    return null;
  };
  return await tryEdicion(edicion)
    || (edicion !== baseEdicion ? await tryEdicion(baseEdicion) : null)
    || null;
}

export const COND_IDS = ['po', 'pl', 'lp', 'gd', 'ex', 'nm', 'mt'];

export async function getAllPrices(card) {
  const emptyPrices = () => Object.fromEntries(COND_IDS.map(c => [c, null]));
  if (!card) return { none: { no: emptyPrices(), yes: emptyPrices() } };

  const number = card.localId;
  const edicion = normalizeEdicion(card);
  const baseEdicion = edicion.replace(/\d+$/, '');

  const checkEditionLang = (database, edKey) => {
    const idBase = `${database.prefix}:${edKey}`;
    const prices = {};
    let foundAny = false;
    for (const condId of COND_IDS) {
      const fullId = `${idBase}:${condId}:${number}`.toLowerCase();
      const found = database.byId.get(fullId);
      prices[condId] = getOffer(found);
      if (prices[condId]) foundAny = true;
    }
    return foundAny ? prices : null;
  };

  const getLangPrices = async (ed) => {
    const dbs = await getDbs(ed);
    const result = {};
    if (dbs) {
      for (const [lang, database] of Object.entries(dbs)) {
        if (!database || database.byId.size === 0) continue;
        const noEd = checkEditionLang(database, 'first-no') || emptyPrices();
        const yesEd = checkEditionLang(database, 'first-yes') || emptyPrices();
        if (Object.values(noEd).some(p => p) || Object.values(yesEd).some(p => p)) {
          result[lang] = { no: noEd, yes: yesEd };
        } else {
          result[lang] = { no: emptyPrices(), yes: emptyPrices() };
        }
      }
    }

    return result;
  };

  const currentEdPrices = await getLangPrices(edicion);
  if (Object.values(currentEdPrices).some(lang => Object.values(lang.no).some(p => p) || Object.values(lang.yes).some(p => p))) {
    return currentEdPrices;
  }

  if (edicion !== baseEdicion) {
    return getLangPrices(baseEdicion);
  }

  return currentEdPrices;
}
