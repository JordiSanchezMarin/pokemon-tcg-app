import React, { useState, useRef, useEffect } from 'react';
import './SetSelector.css';

export default function SetSelector({ value, onChange, sets }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedSet = sets.find(s => s.id === value);

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
          <div 
            className={`set-option ${value === '' ? 'selected' : ''}`}
            onClick={() => handleSelect('')}
          >
            Todas las colecciones (Sets)
          </div>
          {sets.map((set) => (
            <div 
              key={set.id} 
              className={`set-option ${value === set.id ? 'selected' : ''}`}
              onClick={() => handleSelect(set.id)}
            >
              <span className="set-name">{set.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
