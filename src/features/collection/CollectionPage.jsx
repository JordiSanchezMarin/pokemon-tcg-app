import React, { useRef, useState } from 'react';
import CollectionCard from '../../components/CollectionCard';
import CollectionSetsManager from '../../components/CollectionSetsManager';
import { parsePrice, formatPrice } from '../../utils/price';
import { useCollectionPrices } from '../../hooks/usePrices';
import '../../components/MyCollection.css';

export default function CollectionPage({ collection }) {
  const [activeTab, setActiveTab] = useState('sets');
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await collection.importCollection(file);
        alert('Colección importada con éxito');
      } catch {
        alert('Error al importar la colección');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    const prices = pricesByCardId[item.cardData.id];

    Object.entries(item.conditions).forEach(([key, conditionCount]) => {
      if (conditionCount <= 0) return;

      const parts = key.split(':');
      let lang = 'none';
      let editionId;
      let conditionId;

      if (parts.length === 3) {
        [lang, editionId, conditionId] = parts;
      } else {
        [editionId, conditionId] = parts;
      }

      const price = parsePrice(prices?.[lang]?.[editionId]?.[conditionId]);
      if (price !== null) {
        totalCollectionValue += price * conditionCount;
      } else {
        hasMissingPrices = true;
      }
    });
  });

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h2>Mi Colección</h2>
        <div className="collection-actions">
          <button onClick={collection.exportCollection} className="action-btn export-btn">Exportar JSON</button>
          <button onClick={() => fileInputRef.current?.click()} className="action-btn import-btn">Importar JSON</button>
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

      {activeTab === 'sets' && <CollectionSetsManager collection={collection} />}

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
                {!pricesLoading && hasMissingPrices && (
                  <span className="warning-asterisk" title="Faltan precios de algunas cartas">*</span>
                )}
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
              {collectionItems.map(item => (
                <div key={item.cardData.id} className="collection-item">
                  <CollectionCard item={item} collection={collection} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}