import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import useCollection from './hooks/useCollection';

import Home from './components/Home';
import Search from './components/Search';
import MyCollection from './components/MyCollection';
import CardDetail from './components/CardDetail';

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
      <Link to="/collection" className={`nav-link ${location.pathname === '/collection' ? 'active' : ''}`}>
        Mi Colección
      </Link>
    </nav>
  );
}

function App() {
  const collectionData = useCollection();

  // Estado persistente para el buscador durante la navegación
  const [searchFilters, setSearchFilters] = React.useState({
    setName: '',
    pokemonName: '',
    localId: '',
    page: 1
  });

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
            <Route path="/" element={<Home />} />
            <Route 
              path="/search" 
              element={
                <Search 
                  collection={collectionData} 
                  filters={searchFilters}
                  setFilters={setSearchFilters}
                />
              } 
            />
            <Route path="/collection" element={<MyCollection collection={collectionData} />} />
            <Route path="/card/:id" element={<CardDetail collection={collectionData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
