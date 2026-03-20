import React, { useState, useEffect, useRef } from 'react';
import PokemonCard from './PokemonCard';
import './CardGrid.css';

const ITEMS_PER_PAGE = 20;

const CardGrid = ({ cards }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef(null);

  // Reiniciar el contador cuando cambien las cartas (ej. al buscar)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [cards]);

  // Configurar el Intersection Observer para cargar más cartas al llegar al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => 
            prev >= cards.length ? prev : prev + ITEMS_PER_PAGE
          );
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [cards.length]);

  return (
    <div className="grid-container">
      <div className="card-grid">
        {cards.slice(0, visibleCount).map((card) => (
          <PokemonCard key={card.id} card={card} />
        ))}
      </div>
      
      {visibleCount < cards.length && (
        <div ref={observerTarget} className="loading-more-target">
          <div className="shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default CardGrid;
