import React from 'react';
import { useCardSearchQuery, useSetsQuery } from '../hooks/useTcgdexQueries';
import PokemonCard from './PokemonCard';
import SetSelector from './SetSelector';
import './Search.css';

export default function Search({ collection, filters, setFilters }) {
  const { setName, pokemonName, localId, page } = filters;
  const itemsPerPage = 75;
  const setsQuery = useSetsQuery();
  const cardsQuery = useCardSearchQuery(filters, itemsPerPage);
  const sets = setsQuery.data || [];
  const cards = cardsQuery.data || [];
  const loading = cardsQuery.isPending || cardsQuery.isFetching;
  const error = cardsQuery.isError;
  const totalPages = cards.length === 0
    ? 1
    : cards.length === itemsPerPage ? page + 1 : page;

  const updateFilters = (newValues) => {
    setFilters(prev => ({ ...prev, ...newValues }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      updateFilters({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="search-container">
      <h2>Buscador de Cartas</h2>
      
      <div className="search-filters">
        <SetSelector 
          sets={sets}
          value={setName}
          onChange={(val) => updateFilters({ setName: val, page: 1 })}
        />

        <input
          type="text"
          placeholder="Nombre del Pokémon"
          value={pokemonName}
          onChange={(e) => updateFilters({ pokemonName: e.target.value, page: 1 })}
          className="filter-input"
        />

        <input
          type="text"
          placeholder="Número (Local ID)"
          value={localId}
          onChange={(e) => updateFilters({ localId: e.target.value, page: 1 })}
          className="filter-input"
        />
      </div>

      {loading && <div className="loading">Buscando cartas...</div>}
      {(error || setsQuery.isError) && <div className="error">Hubo un error al obtener las cartas.</div>}

      {!loading && !error && cards.length === 0 && (
        <div className="no-results">No se encontraron cartas con estos filtros.</div>
      )}

      <div className="search-results card-grid">
        {cards.map(card => (
          <PokemonCard 
            key={card.id} 
            card={card} 
            collection={collection} 
          />
        ))}
      </div>

      {cards.length > 0 && (
        <div className="pagination">
          <button 
            disabled={page === 1} 
            onClick={() => handlePageChange(page - 1)}
            className="page-btn"
          >
            Anterior
          </button>
          <span className="page-info">Página {page} {totalPages > page ? '...' : ''}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => handlePageChange(page + 1)}
            className="page-btn"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
