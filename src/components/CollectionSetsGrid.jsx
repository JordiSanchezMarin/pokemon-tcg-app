import React, { useState, useEffect } from 'react';
import TCGdex from '@tcgdex/sdk';
import './CollectionSetsGrid.css';

const tcgdex = new TCGdex('en');

export default function CollectionSetsGrid({ collection, onSelectSet }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const result = await tcgdex.set.list();
        setSets(result || []);
      } catch (err) {
        console.error("Error fetching sets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  const collectionItems = Object.values(collection.collection || {});
  
  const ownedPerSet = {};
  collectionItems.forEach(item => {
    if (item.count > 0 && item.cardData) {
      const setId = item.cardData.set?.id || item.cardData.id?.split('-')[0];
      if (setId) {
        ownedPerSet[setId] = (ownedPerSet[setId] || 0) + 1;
      }
    }
  });

  if (loading) {
    return <div className="loading">Cargando colecciones...</div>;
  }

  return (
    <div className="sets-grid-container">
      <div className="sets-grid">
        {sets.map(set => {
          const owned = ownedPerSet[set.id] || 0;
          const total = set.cardCount?.total || set.cardCount?.official || 0;
          const isComplete = total > 0 && owned >= total;
          
          return (
            <div 
              key={set.id} 
              className={`set-card ${isComplete ? 'complete' : ''}`}
              onClick={() => onSelectSet(set.id)}
            >
              <div className="set-logo-container">
                {set.logo ? (
                  <img src={`${set.logo}.png`} alt={set.name} className="set-logo" />
                ) : (
                  <div className="set-no-logo">{set.name}</div>
                )}
              </div>
              <div className="set-info">
                <div className="set-name" title={set.name}>{set.name}</div>
                <div className="set-progress">
                  <div className="progress-text">
                    {owned} / {total}
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min(100, total > 0 ? (owned / total) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
