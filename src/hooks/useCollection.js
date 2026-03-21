import { useState, useEffect } from 'react';
import { getCondKey } from '../utils/price';

// Combined edition:condition keys — e.g. 'no:ex', 'yes:nm'
const DEFAULT_CONDITIONS = () => ({
  'no:po': 0, 'no:pl': 0, 'no:lp': 0, 'no:gd': 0, 'no:ex': 0, 'no:nm': 0, 'no:mt': 0,
  'yes:po': 0, 'yes:pl': 0, 'yes:lp': 0, 'yes:gd': 0, 'yes:ex': 0, 'yes:nm': 0, 'yes:mt': 0,
});

export default function useCollection() {
  const [collection, setCollection] = useState(() => {
    try {
      const savedCollection = localStorage.getItem('pokemon-tcg-collection');
      return savedCollection ? JSON.parse(savedCollection) : {};
    } catch (err) {
      console.error('Error loading collection from localStorage:', err);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('pokemon-tcg-collection', JSON.stringify(collection));
  }, [collection]);

  // lang: e.g. 'none', 'es', 'en'
  // edition: 'no' | 'yes'   condition: 'po'|'pl'|'lp'|'gd'|'ex'|'nm'|'mt'
  const addUnit = (card, lang = 'none', edition = 'no', condition = 'ex') => {
    const safeCard = {
      id: card.id,
      name: card.name,
      image: card.image,
      localId: card.localId,
      rarity: card.rarity,
      set: card.set ? {
        id: card.set.id,
        name: card.set.name,
        cardCount: card.set.cardCount
      } : null,
      types: card.types
    };

    const key = getCondKey(lang, edition, condition);

    setCollection(prev => {
      const current = prev[card.id] || {
        cardData: safeCard,
        count: 0,
        conditions: DEFAULT_CONDITIONS()
      };

      const prevConditions = { ...DEFAULT_CONDITIONS(), ...current.conditions };

      return {
        ...prev,
        [card.id]: {
          ...current,
          cardData: safeCard,
          conditions: {
            ...prevConditions,
            [key]: (prevConditions[key] || 0) + 1
          },
          count: current.count + 1
        }
      };
    });
  };

  const removeUnit = (cardId, condKey = null) => {
    setCollection(prev => {
      const current = prev[cardId];
      if (!current) return prev;

      const prevConditions = { ...DEFAULT_CONDITIONS(), ...current.conditions };

      let targetKey = condKey;
      if (!targetKey) {
        targetKey = Object.keys(prevConditions).find(k => prevConditions[k] > 0);
      }

      if (!targetKey || (prevConditions[targetKey] || 0) <= 0) {
        return prev;
      }

      if (current.count <= 1) {
        const newCollection = { ...prev };
        delete newCollection[cardId];
        return newCollection;
      }

      return {
        ...prev,
        [cardId]: {
          ...current,
          conditions: {
            ...prevConditions,
            [targetKey]: prevConditions[targetKey] - 1
          },
          count: current.count - 1
        }
      };
    });
  };

  const deleteCard = (cardId) => {
    setCollection(prev => {
      const newCollection = { ...prev };
      delete newCollection[cardId];
      return newCollection;
    });
  };

  const getUnitCount = (cardId) => {
    return collection[cardId]?.count || 0;
  };

  // condKey = 'no:ex' | 'yes:nm' etc.
  const getConditionCount = (cardId, condKey) => {
    return collection[cardId]?.conditions?.[condKey] || 0;
  };

  const exportCollection = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collection, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "pokemon_collection.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importCollection = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          setCollection(importedData);
          resolve(true);
        } catch (error) {
          console.error("Error al parsear el archivo JSON", error);
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  return {
    collection,
    addUnit,
    removeUnit,
    deleteCard,
    getUnitCount,
    getConditionCount,
    exportCollection,
    importCollection,
  };
}
