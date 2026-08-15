import React, { useEffect, useState } from 'react';
import { LANG_NAMES } from '../../utils/price';

const CONDITIONS = [
  ['mt', 'Mint'],
  ['nm', 'Near Mint'],
  ['ex', 'Excellent'],
  ['gd', 'Good'],
  ['lp', 'Light Played'],
  ['pl', 'Played'],
  ['po', 'Poor'],
];

function hasPrices(editionPrices) {
  return Object.values(editionPrices).some(Boolean);
}

function EditionPrices({ title, prices, firstEdition = false }) {
  if (!hasPrices(prices)) return null;

  return (
    <div className={`edition-price-block ${firstEdition ? 'first-edition' : ''}`}>
      <h4 className="edition-title">{title}</h4>
      <div className="prices-grid">
        {CONDITIONS.map(([conditionId, label]) => prices[conditionId] && (
          <div key={conditionId} className={`price-item ${conditionId}`}>
            <span className="price-condition">{label}</span>
            <span className="price-value">{prices[conditionId]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CardPrices({ prices }) {
  const pricedLanguages = Object.entries(prices).filter(([, languagePrices]) => (
    hasPrices(languagePrices.no) || hasPrices(languagePrices.yes)
  ));
  const [openLanguages, setOpenLanguages] = useState({});

  useEffect(() => {
    const firstLanguage = pricedLanguages[0]?.[0];
    if (firstLanguage) setOpenLanguages({ [firstLanguage]: true });
  }, [prices]);

  if (pricedLanguages.length === 0) return null;

  return (
    <div className="prices-section">
      <h3>Precios de Mercado (Cardmarket)</h3>
      {pricedLanguages.map(([lang, languagePrices]) => {
        const isOpen = lang === 'none' || openLanguages[lang];

        return (
          <div key={lang} className="lang-prices-group">
            {lang !== 'none' && (
              <button
                className="lang-collapse-btn"
                onClick={() => setOpenLanguages(previous => ({ ...previous, [lang]: !previous[lang] }))}
              >
                <span>Idioma: {LANG_NAMES[lang]}</span>
                <span className={`lang-collapse-arrow ${isOpen ? 'open' : ''}`}>▼</span>
              </button>
            )}
            {isOpen && (
              <div className="editions-prices-container">
                <EditionPrices title="Edición Normal" prices={languagePrices.no} />
                <EditionPrices title="1ª Edición" prices={languagePrices.yes} firstEdition />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}