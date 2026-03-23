import React, { useState } from 'react';
import CollectionSetsGrid from './CollectionSetsGrid';
import CollectionSetDetail from './CollectionSetDetail';

export default function CollectionSetsManager({ collection }) {
  const [selectedSetId, setSelectedSetId] = useState(null);

  if (selectedSetId) {
    return (
      <CollectionSetDetail 
        setId={selectedSetId} 
        collection={collection} 
        onBack={() => setSelectedSetId(null)} 
      />
    );
  }

  return (
    <CollectionSetsGrid 
      collection={collection} 
      onSelectSet={setSelectedSetId} 
    />
  );
}
