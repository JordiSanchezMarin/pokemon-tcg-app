import React from 'react';
import './SearchBar.css';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por nombre (ej: Pikachu) o número (ej: 58)..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
