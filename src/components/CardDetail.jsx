import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TCGdex from '@tcgdex/sdk';
import { getAllPrices, getCardMarketUrl } from '../utils/price';
import './CardDetail.css';

const tcgdex = new TCGdex('en');

export default function CardDetail({ collection }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selEdition, setSelEdition] = useState('no');
  const [selCondition, setSelCondition] = useState('ex');

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await tcgdex.card.get(id);
        if (result) {
          setCard(result);
        } else {
          setError('Carta no encontrada.');
        }
      } catch (err) {
        console.error("Error fetching card details:", err);
        setError('Error al obtener los detalles de la carta.');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  if (loading) return <div className="loading-detail">Cargando detalles de la carta...</div>;
  if (error || !card) return <div className="error-detail">{error || 'Carta no encontrada.'}</div>;

  const count = collection.getUnitCount(card.id);
  const allPrices = getAllPrices(card);
  const cardMarketUrl = getCardMarketUrl(card);

  const selKey = `${selEdition}:${selCondition}`;
  const selCount = collection.getConditionCount(card.id, selKey);

  const handleAdd = () => {
    collection.addUnit(card, selEdition, selCondition);
  };

  const handleRemove = () => {
    collection.removeUnit(card.id, selKey);
  };

  return (
    <div className="card-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Volver
      </button>

      <div className="card-detail-content">
        <div className="card-image-section">
          {card.image ? (
            <img 
              src={`${card.image}/high.webp`} 
              alt={card.name} 
              className="card-detail-img"
            />
          ) : (
            <div className="card-detail-img-placeholder">
              Imagen no disponible
            </div>
          )}
        </div>

        <div className="card-info-section">
          <div className="card-header">
            <h2 className="detail-name">{card.name}</h2>
            <div className="detail-meta">
              <span className="detail-hp">{card.hp ? `HP ${card.hp}` : ''}</span>
              {card.types?.map((type, i) => (
                <span key={i} className={`type-badge type-${type.toLowerCase()}`}>
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="collection-manager">
            <h3>Gestión de Colección</h3>
            <div className="manager-selectors">
              <label className="selector-label">
                Edición
                <select
                  value={selEdition}
                  onChange={e => setSelEdition(e.target.value)}
                  className="detail-select"
                >
                  <option value="no">Normal</option>
                  <option value="yes">1ª Edición</option>
                </select>
              </label>
              <label className="selector-label">
                Estado
                <select
                  value={selCondition}
                  onChange={e => setSelCondition(e.target.value)}
                  className="detail-select"
                >
                  <option value="po">Poor</option>
                  <option value="pl">Played</option>
                  <option value="lp">Light Played</option>
                  <option value="gd">Good</option>
                  <option value="ex">Excellent</option>
                  <option value="nm">Near Mint</option>
                  <option value="mt">Mint</option>
                </select>
              </label>
            </div>
            <div className="manager-controls">
              <span className="owned-text">
                Poseídas <em>({selEdition === 'yes' ? '1ª Ed.' : 'Normal'})</em>: <strong>{selCount}</strong>
                {count > selCount && <span className="total-hint"> · Total: {count}</span>}
              </span>
              <div className="button-group">
                <button
                  onClick={handleRemove}
                  disabled={selCount === 0}
                  className="manage-btn remove"
                >
                  − Quitar 1
                </button>
                <button
                  onClick={handleAdd}
                  className="manage-btn add"
                >
                  + Añadir 1
                </button>
              </div>
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
                <a
                  href={cardMarketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cardmarket-link"
                >
                  Ver en Cardmarket ↗
                </a>
              </div>
            )}
          </div>

          {(Object.values(allPrices.no).some(p => p) || Object.values(allPrices.yes).some(p => p)) && (
            <div className="prices-section">
              <h3>Precios de Mercado (Cardmarket)</h3>
              <div className="editions-prices-container">
                {Object.values(allPrices.no).some(p => p) && (
                  <div className="edition-price-block">
                    <h4 className="edition-title">Edición Normal</h4>
                    <div className="prices-grid">
                      {allPrices.no.mt && (
                        <div className="price-item mt">
                          <span className="price-condition">Mint</span>
                          <span className="price-value">{allPrices.no.mt}</span>
                        </div>
                      )}
                      {allPrices.no.nm && (
                        <div className="price-item nm">
                          <span className="price-condition">Near Mint</span>
                          <span className="price-value">{allPrices.no.nm}</span>
                        </div>
                      )}
                      {allPrices.no.ex && (
                        <div className="price-item ex">
                          <span className="price-condition">Excellent</span>
                          <span className="price-value">{allPrices.no.ex}</span>
                        </div>
                      )}
                      {allPrices.no.gd && (
                        <div className="price-item gd">
                          <span className="price-condition">Good</span>
                          <span className="price-value">{allPrices.no.gd}</span>
                        </div>
                      )}
                      {allPrices.no.lp && (
                        <div className="price-item lp">
                          <span className="price-condition">Light Played</span>
                          <span className="price-value">{allPrices.no.lp}</span>
                        </div>
                      )}
                      {allPrices.no.pl && (
                        <div className="price-item pl">
                          <span className="price-condition">Played</span>
                          <span className="price-value">{allPrices.no.pl}</span>
                        </div>
                      )}
                      {allPrices.no.po && (
                        <div className="price-item po">
                          <span className="price-condition">Poor</span>
                          <span className="price-value">{allPrices.no.po}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {Object.values(allPrices.yes).some(p => p) && (
                  <div className="edition-price-block first-edition">
                    <h4 className="edition-title">1ª Edición</h4>
                    <div className="prices-grid">
                      {allPrices.yes.mt && (
                        <div className="price-item mt">
                          <span className="price-condition">Mint</span>
                          <span className="price-value">{allPrices.yes.mt}</span>
                        </div>
                      )}
                      {allPrices.yes.nm && (
                        <div className="price-item nm">
                          <span className="price-condition">Near Mint</span>
                          <span className="price-value">{allPrices.yes.nm}</span>
                        </div>
                      )}
                      {allPrices.yes.ex && (
                        <div className="price-item ex">
                          <span className="price-condition">Excellent</span>
                          <span className="price-value">{allPrices.yes.ex}</span>
                        </div>
                      )}
                      {allPrices.yes.gd && (
                        <div className="price-item gd">
                          <span className="price-condition">Good</span>
                          <span className="price-value">{allPrices.yes.gd}</span>
                        </div>
                      )}
                      {allPrices.yes.lp && (
                        <div className="price-item lp">
                          <span className="price-condition">Light Played</span>
                          <span className="price-value">{allPrices.yes.lp}</span>
                        </div>
                      )}
                      {allPrices.yes.pl && (
                        <div className="price-item pl">
                          <span className="price-condition">Played</span>
                          <span className="price-value">{allPrices.yes.pl}</span>
                        </div>
                      )}
                      {allPrices.yes.po && (
                        <div className="price-item po">
                          <span className="price-condition">Poor</span>
                          <span className="price-value">{allPrices.yes.po}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {card.attacks && card.attacks.length > 0 && (
            <div className="attacks-section">
              <h3>Ataques</h3>
              {card.attacks.map((attack, index) => (
                <div key={index} className="attack-item">
                  <div className="attack-header">
                    <div className="attack-cost">
                      {attack.cost?.map((type, i) => (
                        <span 
                          key={i} 
                          className={`energy-symbol energy-${type.toLowerCase()}`}
                          title={type}
                        ></span>
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

          {card.weaknesses && card.weaknesses.length > 0 && (
            <div className="weakness-section">
              <h3>Debilidades</h3>
              <div className="weakness-list">
                 {card.weaknesses.map((w, index) => (
                    <span key={index} className="weakness-badge">
                      {w.type} {w.value}
                    </span>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
