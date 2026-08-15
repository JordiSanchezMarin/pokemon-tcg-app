import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CollectionSetsGrid from './CollectionSetsGrid';
import CollectionSetDetail from './CollectionSetDetail';

export default function CollectionSetsManager({ collection }) {
  const { setId } = useParams();
  const navigate = useNavigate();

  if (setId) {
    return (
      <CollectionSetDetail 
        setId={setId}
        collection={collection} 
        onBack={() => navigate('/collection')}
      />
    );
  }

  return (
    <CollectionSetsGrid 
      collection={collection} 
      onSelectSet={selectedSetId => navigate(`/collection/set/${encodeURIComponent(selectedSetId)}`)}
    />
  );
}
