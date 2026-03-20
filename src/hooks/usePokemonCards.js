import { useState, useEffect } from 'react';

const usePokemonCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        // TCGdex API - Vamos a hacer la petición global de la colección para asegurar que obtenemos datos
        const response = await fetch('https://api.tcgdex.net/v2/en/cards');

        if (!response.ok) {
          throw new Error('No se pudo obtener la información de las cartas');
        }

        const data = await response.json();

        if (data && data.length > 0) {
          // Filtramos las cartas del Base Set
          const baseSetCards = data.filter(card => card.id.startsWith('base1-'));

          // Ordenamos por número local (es un string, aseguramos un parseo numérico para el sort)
          baseSetCards.sort((a, b) => parseInt(a.localId) - parseInt(b.localId));

          setCards(baseSetCards);
        } else {
          setCards([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return { cards, loading, error };
};

export default usePokemonCards;
