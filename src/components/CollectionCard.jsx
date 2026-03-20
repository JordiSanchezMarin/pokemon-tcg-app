import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPrices, parsePrice, formatPrice } from '../utils/price';
import './CollectionCard.css';

const EDITIONS = [
  { id: 'no',  label: 'Normal' },
  { id: 'yes', label: '1ª Edición' },
];

const CONDITIONS = [
  { id: 'po', label: 'Poor' },
  { id: 'pl', label: 'Played' },
  { id: 'lp', label: 'Light Played' },
  { id: 'gd', label: 'Good' },
  { id: 'ex', label: 'Excellent' },
  { id: 'nm', label: 'Near Mint' },
  { id: 'mt', label: 'Mint' },
];

export default function CollectionCard({ item, collection }) {
  const card = item.cardData;
  const count = item.count;
  const [openEditions, setOpenEditions] = useState({});

  const toggleEdition = (edId) => {
    setOpenEditions(prev => ({ ...prev, [edId]: !prev[edId] }));
  };

  const prices = getAllPrices(card);
  let totalCardValue = 0;
  let hasMissingPrices = false;

  EDITIONS.forEach(({ id: edId }) => {
    CONDITIONS.forEach(({ id: condId }) => {
      const key = `${edId}:${condId}`;
      const condCount = collection.getConditionCount(card.id, key);
      if (condCount > 0) {
        const price = parsePrice(prices[edId]?.[condId]);
        if (price !== null) {
          totalCardValue += price * condCount;
        } else {
          hasMissingPrices = true;
        }
      }
    });
  });

  return (
    <div className="collection-card-wrapper">
      <Link to={`/card/${card.id}`} className="collection-card-link">
        <div className="collection-card">
          <div className="card-image-container">
            {card.image ? (
              <img
                src={`${card.image}/low.webp`}
                alt={card.name}
                className="card-image"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://tcgdex.dev/assets/card-back.webp';
                }}
              />
            ) : (
              <div className="card-image-placeholder">No Image</div>
            )}
            {count > 0 && (
              <div className="owned-badge">{count}</div>
            )}
          </div>

          <div className="card-info">
            <h3 className="card-name">{card.name}</h3>
            <p className="card-id">{card.id}</p>
            <div className="card-total-value">
              <span className="value-label">Valor:</span>
              <span className="value-amount">
                {totalCardValue > 0 || !hasMissingPrices ? formatPrice(totalCardValue) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="conditions-list">
        {EDITIONS.map(({ id: edId, label: edLabel }) => {
          const isOpen = !!openEditions[edId];
          const editionCount = CONDITIONS.reduce((sum, { id: condId }) =>
            sum + collection.getConditionCount(card.id, `${edId}:${condId}`), 0);
          return (
            <div key={edId} className={`edition-group ${isOpen ? 'open' : ''}`}>
              <button
                className="edition-group-toggle"
                onClick={() => toggleEdition(edId)}
              >
                <span className="edition-group-label">
                  {edLabel}
                  {editionCount > 0 && <span className="edition-count-badge">{editionCount}</span>}
                </span>
                <span className={`accordion-arrow ${isOpen ? 'up' : ''}`}>▾</span>
              </button>
              {isOpen && (
                <div className="edition-group-body">
            {CONDITIONS.map(({ id: condId, label: condLabel }) => {
              const key = `${edId}:${condId}`;
              const condCount = collection.getConditionCount(card.id, key);
              const price = parsePrice(prices[edId]?.[condId]);
              return (
                <div key={key} className={`condition-row ${condCount > 0 ? 'active' : ''}`}>
                  <div className="condition-info">
                    <span className="condition-name">{condLabel}</span>
                    <span className="condition-price">
                      {price !== null ? formatPrice(price) : 'N/A'}
                    </span>
                  </div>
                  <div className="condition-controls">
                    <button
                      onClick={(e) => { e.preventDefault(); collection.removeUnit(card.id, key); }}
                      disabled={condCount === 0}
                      className="cond-btn minus"
                    >−</button>
                    <span className="cond-count">{condCount}</span>
                    <button
                      onClick={(e) => { e.preventDefault(); collection.addUnit(card, edId, condId); }}
                      className="cond-btn plus"
                    >+</button>
                  </div>
                </div>
                );
            })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="delete-card-btn"
        onClick={() => collection.deleteCard(card.id)}
      >
        Quitar todas ({count})
      </button>
    </div>
  );
}
