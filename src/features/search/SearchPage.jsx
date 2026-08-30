import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCardSearchQuery, useSetsQuery } from '../../hooks/useTcgdexQueries';
import PokemonCard from '../../components/PokemonCard';
import SetSelector from '../../components/SetSelector';
import { mergeSearchFilters, readSearchFilters } from './searchParams';
import '../../components/Search.css';

export default function SearchPage({ collection }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const latestSearchParams = React.useRef(searchParams);
  latestSearchParams.current = searchParams;
  const filters = readSearchFilters(searchParams);
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

  const updateFilters = (newValues, options = {}) => {
    const nextSearchParams = mergeSearchFilters(latestSearchParams.current, newValues);
    latestSearchParams.current = nextSearchParams;
    setSearchParams(nextSearchParams, { replace: options.replace ?? true });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      updateFilters({ page: newPage }, { replace: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginationControls = cards.length > 0 && (
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
  );

  return (
    <div className="search-container">
      <h2>Buscador de Cartas</h2>

      <div className="search-filters">
        <SetSelector
          sets={sets}
          value={setName}
          onChange={(value) => updateFilters({ setName: value, page: 1 })}
        />

        <input
          type="text"
          placeholder="Nombre del Pokémon"
          value={pokemonName}
          onChange={(event) => updateFilters({ pokemonName: event.target.value, page: 1 })}
          className="filter-input"
        />

        <input
          type="text"
          placeholder="Número (Local ID)"
          value={localId}
          onChange={(event) => updateFilters({ localId: event.target.value, page: 1 })}
          className="filter-input"
        />
      </div>

      {paginationControls}

      {loading && <div className="loading">Buscando cartas...</div>}
      {(error || setsQuery.isError) && <div className="error">Hubo un error al obtener las cartas.</div>}

      {!loading && !error && cards.length === 0 && (
        <div className="no-results">No se encontraron cartas con estos filtros.</div>
      )}

      <div className="search-results card-grid">
        {cards.map(card => (
          <PokemonCard key={card.id} card={card} collection={collection} />
        ))}
      </div>

      {paginationControls}
    </div>
  );
}