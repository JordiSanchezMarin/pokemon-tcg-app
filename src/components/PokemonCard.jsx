import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AddCardModal from './AddCardModal';
import './PokemonCard.css';

export default function PokemonCard({ card, collection }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const count = collection.getUnitCount(card.id);

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmAdd = ({ lang, edition, condition }) => {
    collection.addUnit(card, lang, edition, condition);
    setIsModalOpen(false);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    collection.removeUnit(card.id);
  };

  return (
    <div className={`pokemon-card-wrapper ${count > 0 ? 'owned' : ''}`}>
      <Link to={`/card/${card.id}`} className="pokemon-card-link">
        <div className="pokemon-card">
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
              <div className="owned-badge">
                {count}
              </div>
            )}
          </div>
          
          <div className="card-info">
            <h3 className="card-name">{card.name}</h3>
            <p className="card-id">{card.id}</p>

          </div>
        </div>
      </Link>

      <div className="collection-controls">
        <button 
          onClick={handleRemove} 
          disabled={count === 0}
          className="control-btn remove-btn"
          aria-label="Quitar de la colección"
        >
          -
        </button>
        <span className="count-display">{count}</span>
        <button 
          onClick={handleAddClick} 
          className="control-btn add-btn"
          aria-label="Añadir a la colección"
        >
          +
        </button>
      </div>

      {isModalOpen && (
        <AddCardModal 
          card={card}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
}
