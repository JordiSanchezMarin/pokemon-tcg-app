import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvailableLanguages, LANG_NAMES, getCondKey } from '../utils/price';
import { useCardPricing } from '../hooks/usePrices';
import { useCardQuery } from '../hooks/useTcgdexQueries';
import './CardDetail.css';

export default function CardDetail({ collection }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const cardQuery = useCardQuery(id);
  const card = cardQuery.data || null;

  const [selEdition, setSelEdition] = useState('no');
  const [selCondition, setSelCondition] = useState('ex');
  const [selLang, setSelLang] = useState('none');
  const [openLangs, setOpenLangs] = useState({});
  const { prices: allPrices, cardMarketUrl } = useCardPricing(card);

  const toggleLang = (lang) => {
    setOpenLangs(prev => ({...prev, [lang]: !prev[lang]}));
  };

  useEffect(() => {
    if (card) {
      const langs = getAvailableLanguages(card);
      setSelLang(langs[0]);
      
      const initialOpen = {};
      langs.forEach((l, i) => {
        initialOpen[l] = i === 0;
      });
      setOpenLangs(initialOpen);
    }
  }, [card]);

  if (cardQuery.isPending) return <div className="loading-detail">Cargando detalles de la carta...</div>;
  if (cardQuery.isError || !card) {
    return <div className="error-detail">{cardQuery.isError ? 'Error al obtener los detalles de la carta.' : 'Carta no encontrada.'}</div>;
  }

  const count = collection.getUnitCount(card.id);
  const availableLangs = getAvailableLanguages(card);

  const selKey = getCondKey(selLang, selEdition, selCondition);
  const selCount = collection.getConditionCount(card.id, selKey);

  const handleAdd = () => {
    collection.addUnit(card, selLang, selEdition, selCondition);
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
              {availableLangs.length > 0 && availableLangs[0] !== 'none' && (
                <label className="selector-label">
                  Idioma
                  <select
                    value={selLang}
                    onChange={e => setSelLang(e.target.value)}
                    className="detail-select"
                  >
                    {availableLangs.map(lang => (
                      <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>
                    ))}
                  </select>
                </label>
              )}
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
                Poseídas <em>({selEdition === 'yes' ? '1ª Ed.' : 'Normal'}
                {selLang !== 'none' ? ` - ${LANG_NAMES[selLang]}` : ''})</em>: <strong>{selCount}</strong>
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
          {Object.entries(allPrices).some(([_, langPrices]) => 
            Object.values(langPrices.no).some(p => p) || Object.values(langPrices.yes).some(p => p)
          ) && (
            <div className="prices-section">
              <h3>Precios de Mercado (Cardmarket)</h3>
              {Object.entries(allPrices).filter(([_, langPrices]) => 
                Object.values(langPrices.no).some(p => p) || Object.values(langPrices.yes).some(p => p)
              ).map(([lang, langPrices]) => (
                <div key={lang} className="lang-prices-group">
                  {lang !== 'none' ? (
                    <button className="lang-collapse-btn" onClick={() => toggleLang(lang)}>
                      <span>Idioma: {LANG_NAMES[lang]}</span>
                      <span className={`lang-collapse-arrow ${openLangs[lang] ? 'open' : ''}`}>▼</span>
                    </button>
                  ) : null}
                  {(lang === 'none' || openLangs[lang]) && (
                    <div className="editions-prices-container">
                    {Object.values(langPrices.no).some(p => p) && (
                      <div className="edition-price-block">
                        <h4 className="edition-title">Edición Normal</h4>
                        <div className="prices-grid">
                          {langPrices.no.mt && (
                            <div className="price-item mt">
                              <span className="price-condition">Mint</span>
                              <span className="price-value">{langPrices.no.mt}</span>
                            </div>
                          )}
                          {langPrices.no.nm && (
                            <div className="price-item nm">
                              <span className="price-condition">Near Mint</span>
                              <span className="price-value">{langPrices.no.nm}</span>
                            </div>
                          )}
                          {langPrices.no.ex && (
                            <div className="price-item ex">
                              <span className="price-condition">Excellent</span>
                              <span className="price-value">{langPrices.no.ex}</span>
                            </div>
                          )}
                          {langPrices.no.gd && (
                            <div className="price-item gd">
                              <span className="price-condition">Good</span>
                              <span className="price-value">{langPrices.no.gd}</span>
                            </div>
                          )}
                          {langPrices.no.lp && (
                            <div className="price-item lp">
                              <span className="price-condition">Light Played</span>
                              <span className="price-value">{langPrices.no.lp}</span>
                            </div>
                          )}
                          {langPrices.no.pl && (
                            <div className="price-item pl">
                              <span className="price-condition">Played</span>
                              <span className="price-value">{langPrices.no.pl}</span>
                            </div>
                          )}
                          {langPrices.no.po && (
                            <div className="price-item po">
                              <span className="price-condition">Poor</span>
                              <span className="price-value">{langPrices.no.po}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {Object.values(langPrices.yes).some(p => p) && (
                      <div className="edition-price-block first-edition">
                        <h4 className="edition-title">1ª Edición</h4>
                        <div className="prices-grid">
                          {langPrices.yes.mt && (
                            <div className="price-item mt">
                              <span className="price-condition">Mint</span>
                              <span className="price-value">{langPrices.yes.mt}</span>
                            </div>
                          )}
                          {langPrices.yes.nm && (
                            <div className="price-item nm">
                              <span className="price-condition">Near Mint</span>
                              <span className="price-value">{langPrices.yes.nm}</span>
                            </div>
                          )}
                          {langPrices.yes.ex && (
                            <div className="price-item ex">
                              <span className="price-condition">Excellent</span>
                              <span className="price-value">{langPrices.yes.ex}</span>
                            </div>
                          )}
                          {langPrices.yes.gd && (
                            <div className="price-item gd">
                              <span className="price-condition">Good</span>
                              <span className="price-value">{langPrices.yes.gd}</span>
                            </div>
                          )}
                          {langPrices.yes.lp && (
                            <div className="price-item lp">
                              <span className="price-condition">Light Played</span>
                              <span className="price-value">{langPrices.yes.lp}</span>
                            </div>
                          )}
                          {langPrices.yes.pl && (
                            <div className="price-item pl">
                              <span className="price-condition">Played</span>
                              <span className="price-value">{langPrices.yes.pl}</span>
                            </div>
                          )}
                          {langPrices.yes.po && (
                            <div className="price-item po">
                              <span className="price-condition">Poor</span>
                              <span className="price-value">{langPrices.yes.po}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
      </div>
    </div>
  );
}

