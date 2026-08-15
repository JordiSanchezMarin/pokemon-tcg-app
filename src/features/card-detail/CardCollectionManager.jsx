import React, { useEffect, useState } from 'react';
import { getAvailableLanguages, getCondKey, LANG_NAMES } from '../../utils/price';

export default function CardCollectionManager({ card, collection }) {
  const availableLanguages = getAvailableLanguages(card);
  const [edition, setEdition] = useState('no');
  const [condition, setCondition] = useState('ex');
  const [lang, setLang] = useState(availableLanguages[0] || 'none');

  useEffect(() => {
    setLang(availableLanguages[0] || 'none');
  }, [card.id]);

  const conditionKey = getCondKey(lang, edition, condition);
  const selectedCount = collection.getConditionCount(card.id, conditionKey);
  const totalCount = collection.getUnitCount(card.id);

  return (
    <div className="collection-manager">
      <h3>Gestión de Colección</h3>
      <div className="manager-selectors">
        {availableLanguages[0] !== 'none' && (
          <label className="selector-label">
            Idioma
            <select value={lang} onChange={event => setLang(event.target.value)} className="detail-select">
              {availableLanguages.map(language => (
                <option key={language} value={language}>{LANG_NAMES[language]}</option>
              ))}
            </select>
          </label>
        )}
        <label className="selector-label">
          Edición
          <select value={edition} onChange={event => setEdition(event.target.value)} className="detail-select">
            <option value="no">Normal</option>
            <option value="yes">1ª Edición</option>
          </select>
        </label>
        <label className="selector-label">
          Estado
          <select value={condition} onChange={event => setCondition(event.target.value)} className="detail-select">
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
          Poseídas <em>({edition === 'yes' ? '1ª Ed.' : 'Normal'}
          {lang !== 'none' ? ` - ${LANG_NAMES[lang]}` : ''})</em>: <strong>{selectedCount}</strong>
          {totalCount > selectedCount && <span className="total-hint"> · Total: {totalCount}</span>}
        </span>
        <div className="button-group">
          <button
            onClick={() => collection.removeUnit(card.id, conditionKey)}
            disabled={selectedCount === 0}
            className="manage-btn remove"
          >
            − Quitar 1
          </button>
          <button
            onClick={() => collection.addUnit(card, lang, edition, condition)}
            className="manage-btn add"
          >
            + Añadir 1
          </button>
        </div>
      </div>
    </div>
  );
}