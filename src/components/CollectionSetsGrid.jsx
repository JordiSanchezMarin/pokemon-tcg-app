import React from 'react';
import { useSetsQuery } from '../hooks/useTcgdexQueries';
import './CollectionSetsGrid.css';

export default function CollectionSetsGrid({ collection, onSelectSet }) {
  const setsQuery = useSetsQuery();
  const sets = setsQuery.data || [];

  const collectionItems = Object.values(collection.collection || {});
  
  const ownedPerSet = {};
  collectionItems.forEach(item => {
    if (collection.getUnitCount(item.cardData?.id) > 0 && item.cardData) {
      const setId = item.cardData.set?.id || item.cardData.id?.split('-')[0];
      if (setId) {
        ownedPerSet[setId] = (ownedPerSet[setId] || 0) + 1;
      }
    }
  });

  if (setsQuery.isPending) {
    return <div className="loading">Cargando colecciones...</div>;
  }

  if (setsQuery.isError) {
    return <div className="error">Error al cargar las colecciones.</div>;
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
