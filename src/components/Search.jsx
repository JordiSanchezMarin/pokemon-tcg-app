import React, { useState, useEffect } from 'react';
import TCGdex, { Query } from '@tcgdex/sdk';
import PokemonCard from './PokemonCard';
import SetSelector from './SetSelector';
import './Search.css';

const tcgdex = new TCGdex('en');

export default function Search({ collection, filters, setFilters }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { setName, pokemonName, localId, page } = filters;
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 75;

  // Opciones de filter
  const [sets, setSets] = useState([]);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const result = await tcgdex.set.list();
        setSets(result || []);
      } catch (err) {
        console.error("Error fetching sets:", err);
      }
    };
    
    fetchSets();
  }, []);

  const searchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = Query.create();
      
      if (pokemonName) {
        query.contains('name', pokemonName);
      }
      if (setName) {
        query.equal('set.id', setName); 
      }
      if (localId) {
        query.equal('localId', localId);
      }

      query.paginate(page, itemsPerPage);

      const results = await tcgdex.card.list(query);
      
      if (results && results.length > 0) {
        setCards(results);
        
        if (results.length === itemsPerPage) {
          setTotalPages(page + 1);
        } else {
          setTotalPages(page);
        }
      } else {
        setCards([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError("Hubo un error al buscar las cartas.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchCards();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [setName, pokemonName, localId, page]);

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
      {error && <div className="error">{error}</div>}

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
