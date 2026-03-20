import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">¡Bienvenido a tu Colección Pokémon TCG!</h1>
        <p className="home-description">
          Esta aplicación te permite gestionar tu colección de cartas de Pokémon de forma sencilla y eficiente.
        </p>
        
        <div className="features-grid">
          <Link to="/search" className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Buscador Avanzado</h3>
              <p>
                Explora la inmensa base de datos de cartas Pokémon. Puedes filtrar por colección (Set), 
                idioma, nombre del Pokémon o número de la carta dentro del set.
                ¡Añade cartas a tu colección con un solo clic!
              </p>
            </div>
          </Link>
          
          <Link to="/collection" className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">🎒</div>
              <h3>Mi Colección</h3>
              <p>
                Visualiza todas las cartas que posees en un único lugar. Modifica las cantidades de cada 
                carta fácilmente, guárdalas de forma local y ten el control total de lo que tienes.
              </p>
            </div>
          </Link>

          <Link to="/collection" className="feature-card-link">
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Exportar e Importar</h3>
              <p>
                Tu colección se guarda localmente en este dispositivo. Sin embargo, puedes exportarla como 
                un archivo JSON para llevártela a otro dispositivo o hacer una copia de seguridad y luego importarla.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
