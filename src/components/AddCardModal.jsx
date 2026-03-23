import React, { useState } from 'react';
import { getAvailableLanguages, LANG_NAMES, COND_IDS } from '../utils/price';
import './AddCardModal.css';

const COND_NAMES = {
  po: 'Poor (PO)',
  pl: 'Played (PL)',
  lp: 'Light Played (LP)',
  gd: 'Good (GD)',
  ex: 'Excellent (EX)',
  nm: 'Near Mint (NM)',
  mt: 'Mint (MT)'
};

export default function AddCardModal({ card, onClose, onConfirm }) {
  const availableLangs = getAvailableLanguages(card);
  
  const [lang, setLang] = useState(availableLangs.length > 0 ? availableLangs[0] : 'none');
  const [edition, setEdition] = useState('no');
  const [condition, setCondition] = useState('ex');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm({ lang, edition, condition });
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h3>Añadir a Colección</h3>
        <p className="modal-subtitle">{card.name}</p>

        <form onSubmit={handleConfirm} className="add-card-form">
          <div className="form-group">
            <label>Estado (Condition):</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {COND_IDS.map(c => (
                <option key={c} value={c}>{COND_NAMES[c]}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Edición:</label>
            <select value={edition} onChange={(e) => setEdition(e.target.value)}>
              <option value="no">Normal</option>
              <option value="yes">Primera Edición (1st Ed)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Idioma:</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {availableLangs.length === 0 && <option value="none">Único</option>}
              {availableLangs.map(l => (
                <option key={l} value={l}>{LANG_NAMES[l] || l}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-confirm">Añadir Carta</button>
          </div>
        </form>
      </div>
    </div>
  );
}
