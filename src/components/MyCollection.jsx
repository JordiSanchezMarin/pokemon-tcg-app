import React, { useRef, useState } from 'react';
import CollectionCard from './CollectionCard';
import CollectionSetsManager from './CollectionSetsManager';
import { parsePrice, formatPrice } from '../utils/price';
import { useCollectionPrices } from '../hooks/usePrices';
import './MyCollection.css';

export default function MyCollection({ collection }) {
  const [activeTab, setActiveTab] = useState('sets');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    collection.exportCollection();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await collection.importCollection(file);
        alert('Colección importada con éxito');
      } catch (error) {
        alert('Error al importar la colección');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const collectionItems = Object.values(collection.collection);
  const { pricesByCardId, loading: pricesLoading } = useCollectionPrices(
    collectionItems.map(item => item.cardData)
  );
  const totalCards = collectionItems.reduce(
    (total, item) => total + collection.getUnitCount(item.cardData.id),
    0
  );
  const uniqueCards = collectionItems.length;

  let totalCollectionValue = 0;
  let hasMissingPrices = false;

  collectionItems.forEach(item => {
    const card = item.cardData;
    const prices = pricesByCardId[card.id];
    
    // item.conditions contains keys like 'es:no:nm' or 'no:nm'
    Object.entries(item.conditions).forEach(([key, condCount]) => {
      if (condCount > 0) {
        const parts = key.split(':');
        let lang = 'none', edId, condId;
        if (parts.length === 3) {
          [lang, edId, condId] = parts;
        } else {
          // Backward compatibility for old keys without language ('no:ex')
          [edId, condId] = parts;
        }

        const priceStr = prices?.[lang]?.[edId]?.[condId];
        const price = parsePrice(priceStr);
        if (price !== null) {
          totalCollectionValue += price * condCount;
        } else {
          hasMissingPrices = true;
        }
      }
    });
  });

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h2>Mi Colección</h2>
        <div className="collection-actions">
          <button onClick={handleExport} className="action-btn export-btn">
            Exportar JSON
          </button>
          <button onClick={handleImportClick} className="action-btn import-btn">
            Importar JSON
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div className="collection-tabs">
        <button 
          className={`collection-tab ${activeTab === 'sets' ? 'active' : ''}`}
          onClick={() => setActiveTab('sets')}
        >
          Colecciones
        </button>
        <button 
          className={`collection-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Resumen
        </button>
      </div>

      {activeTab === 'sets' && (
        <CollectionSetsManager collection={collection} />
      )}

      {activeTab === 'stats' && (
        <>
          <div className="collection-stats">
            <div className="stat-box">
              <span className="stat-value">{totalCards}</span>
              <span className="stat-label">Cartas Totales</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{uniqueCards}</span>
              <span className="stat-label">Cartas Únicas</span>
            </div>
            <div className="stat-box highlight-stat">
              <span className="stat-value">
                {pricesLoading ? 'Calculando...' : formatPrice(totalCollectionValue)}
                {!pricesLoading && hasMissingPrices && <span className="warning-asterisk" title="Faltan precios de algunas cartas">*</span>}
              </span>
              <span className="stat-label">Valor Total Estimado</span>
            </div>
          </div>

          {uniqueCards === 0 ? (
            <div className="empty-collection">
              <p>Tu colección está vacía. ¡Ve al buscador para añadir cartas!</p>
            </div>
          ) : (
            <div className="card-grid">
              {collectionItems.map((item) => (
                <div key={item.cardData.id} className="collection-item">
                  <CollectionCard 
                    item={item} 
                    collection={collection} 
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
