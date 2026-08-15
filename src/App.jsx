import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import useCollection from './hooks/useCollection';

import HomePage from './features/home/HomePage';
import SearchPage from './features/search/SearchPage';
import CollectionPage from './features/collection/CollectionPage';
import CardDetailPage from './features/card-detail/CardDetailPage';

import './App.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="app-nav">
      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        Inicio
      </Link>
      <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
        Buscador
      </Link>
      <Link to="/collection" className={`nav-link ${location.pathname.startsWith('/collection') ? 'active' : ''}`}>
        Mi Colección
      </Link>
    </nav>
  );
}

function App() {
  const collectionData = useCollection();

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>Pokémon TCG</h1>
            <Navigation />
          </div>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/search" 
              element={<SearchPage collection={collectionData} />}
            />
            <Route path="/collection" element={<CollectionPage collection={collectionData} />} />
            <Route path="/collection/set/:setId" element={<CollectionPage collection={collectionData} />} />
            <Route path="/card/:id" element={<CardDetailPage collection={collectionData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
