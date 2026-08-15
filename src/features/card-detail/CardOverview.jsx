import React from 'react';

export default function CardOverview({ card, cardMarketUrl }) {
  return (
    <>
      <div className="card-header">
        <h2 className="detail-name">{card.name}</h2>
        <div className="detail-meta">
          <span className="detail-hp">{card.hp ? `HP ${card.hp}` : ''}</span>
          {card.types?.map(type => (
            <span key={type} className={`type-badge type-${type.toLowerCase()}`}>{type}</span>
          ))}
        </div>
      </div>

      <div className="card-details-grid">
        <div className="detail-row">
          <span className="detail-label">Set:</span>
          <span className="detail-value">{card.set?.name || 'Desconocido'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Rareza:</span>
          <span className="detail-value">{card.rarity || '-'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Número de colección:</span>
          <span className="detail-value">{card.localId} / {card.set?.cardCount?.total}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ilustrador:</span>
          <span className="detail-value">{card.illustrator || '-'}</span>
        </div>
        {cardMarketUrl && (
          <div className="detail-row cardmarket-row">
            <span className="detail-label">Cardmarket:</span>
            <a href={cardMarketUrl} target="_blank" rel="noopener noreferrer" className="cardmarket-link">
              Ver en Cardmarket ↗
            </a>
          </div>
        )}
      </div>

      {card.attacks?.length > 0 && (
        <div className="attacks-section">
          <h3>Ataques</h3>
          {card.attacks.map((attack, attackIndex) => (
            <div key={`${attack.name}-${attackIndex}`} className="attack-item">
              <div className="attack-header">
                <div className="attack-cost">
                  {attack.cost?.map((type, typeIndex) => (
                    <span
                      key={`${type}-${typeIndex}`}
                      className={`energy-symbol energy-${type.toLowerCase()}`}
                      title={type}
                    />
                  ))}
                </div>
                <span className="attack-name">{attack.name}</span>
                <span className="attack-damage">{attack.damage}</span>
              </div>
              {attack.effect && <p className="attack-effect">{attack.effect}</p>}
            </div>
          ))}
        </div>
      )}

      {card.weaknesses?.length > 0 && (
        <div className="weakness-section">
          <h3>Debilidades</h3>
          <div className="weakness-list">
            {card.weaknesses.map((weakness, index) => (
              <span key={`${weakness.type}-${index}`} className="weakness-badge">
                {weakness.type} {weakness.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}