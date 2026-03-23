import React, { useState, useRef, useEffect, useMemo } from 'react';
import './SetSelector.css';

export default function SetSelector({ value, onChange, sets }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedSet = sets.find(s => s.id === value);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (setId) => {
    onChange(setId);
    setIsOpen(false);
  };

  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) return sets;
    const lowerQuery = searchQuery.toLowerCase();
    return sets.filter(set => set.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery, sets]);

  return (
    <div className="set-selector-container" ref={containerRef}>
      <div 
        className={`set-selector-header ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="set-selector-value">
          {selectedSet ? (
            <span className="set-name">{selectedSet.name}</span>
          ) : (
            <span className="set-placeholder">Todas las colecciones (Sets)</span>
          )}
        </div>
        <span className="set-selector-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="set-selector-dropdown">
          <div className="set-search-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="set-search-input"
              placeholder="Buscar colección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div 
            className={`set-option ${value === '' ? 'selected' : ''}`}
            onClick={() => handleSelect('')}
          >
            Todas las colecciones (Sets)
          </div>
          {filteredSets.map((set) => (
            <div 
              key={set.id} 
              className={`set-option ${value === set.id ? 'selected' : ''}`}
              onClick={() => handleSelect(set.id)}
            >
              <span className="set-name">{set.name}</span>
            </div>
          ))}
          {filteredSets.length === 0 && (
            <div className="set-option no-results">
              No se encontraron colecciones
            </div>
          )}
        </div>
      )}
    </div>
  );
}
