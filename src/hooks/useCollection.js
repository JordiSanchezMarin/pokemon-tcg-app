import { useState, useEffect } from 'react';
import {
  addUnit as addCollectionUnit,
  deleteCard as deleteCollectionCard,
  getConditionCount as selectConditionCount,
  getUnitCount as selectUnitCount,
  removeUnit as removeCollectionUnit,
} from '../domain/collection';
import {
  loadCollection,
  parseCollectionJson,
  saveCollection,
  serializeCollection,
} from '../storage/collectionStorage';
import { getCondKey } from '../utils/price';

export default function useCollection() {
  const [collection, setCollection] = useState(() => {
    try {
      return loadCollection();
    } catch (err) {
      console.error('Error loading collection from localStorage:', err);
      return {};
    }
  });

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  // lang: e.g. 'none', 'es', 'en'
  // edition: 'no' | 'yes'   condition: 'po'|'pl'|'lp'|'gd'|'ex'|'nm'|'mt'
  const addUnit = (card, lang = 'none', edition = 'no', condition = 'ex') => {
    const key = getCondKey(lang, edition, condition);
    setCollection(previous => addCollectionUnit(previous, card, key));
  };

  const removeUnit = (cardId, condKey = null) => {
    setCollection(previous => removeCollectionUnit(previous, cardId, condKey));
  };

  const deleteCard = (cardId) => {
    setCollection(previous => deleteCollectionCard(previous, cardId));
  };

  const getUnitCount = (cardId) => {
    return selectUnitCount(collection, cardId);
  };

  // condKey = 'no:ex' | 'yes:nm' etc.
  const getConditionCount = (cardId, condKey) => {
    return selectConditionCount(collection, cardId, condKey);
  };

  const exportCollection = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(serializeCollection(collection));
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
          const importedData = parseCollectionJson(event.target.result);
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
