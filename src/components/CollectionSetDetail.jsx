import React from 'react';
import { useSetQuery } from '../hooks/useTcgdexQueries';
import './CollectionSetDetail.css';

export default function CollectionSetDetail({ setId, collection, onBack }) {
  const setQuery = useSetQuery(setId);
  const setDetails = setQuery.data || null;

  if (setQuery.isPending) {
    return <div className="loading">Cargando cartas del set...</div>;
  }

  if (!setDetails) {
    return (
      <div>
        <button onClick={onBack} className="back-btn">← Volver</button>
        <div className="error">Error al cargar la colección.</div>
      </div>
    );
  }

  const { cards } = setDetails;
  
  let ownedCount = 0;
  
  const cardItems = cards.map(c => {
    const count = collection.getUnitCount(c.id);
    const isOwned = count > 0;
    if (isOwned) ownedCount++;
    return { ...c, isOwned, count };
  });

  return (
    <div className="set-detail-container">
      <div className="set-detail-header">
        <button onClick={onBack} className="back-btn">← Volver a Colecciones</button>
        <div className="set-detail-title">
          {setDetails.logo && <img src={`${setDetails.logo}.png`} alt={setDetails.name} className="set-detail-logo" />}
          <div className="set-detail-info">
            <h2>{setDetails.name}</h2>
            <div className="set-detail-stats">
              Progreso: {ownedCount} / {cards.length} ({Math.round((ownedCount / cards.length) * 100 || 0)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="set-cards-grid">
        {cardItems.map(card => (
          <div key={card.id} className={`set-card-item ${card.isOwned ? 'owned' : 'missing'}`}>
            <div className="set-card-image-wrapper">
              {card.image ? (
                <img 
                  src={`${card.image}/low.webp`} 
                  alt={card.name} 
                  className="set-card-image" 
                  loading="lazy" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://tcgdex.dev/assets/card-back.webp';
                  }}
                />
              ) : (
                <div className="set-card-placeholder">Sin imagen</div>
              )}
              {card.isOwned && (
                <div className="owned-checkmark">
                  ✓
                </div>
              )}
              {!card.isOwned && (
                <div className="missing-overlay"></div>
              )}
            </div>
            <div className="set-card-label">
              <span className="set-card-number">{card.localId}</span>
              <span className="set-card-name" title={card.name}>{card.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
