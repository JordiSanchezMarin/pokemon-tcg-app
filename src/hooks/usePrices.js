import { useEffect, useRef, useState } from 'react';
import { getAllPrices, getCardMarketUrl } from '../utils/price';

export function useCardPricing(card) {
  const [state, setState] = useState({
    prices: {},
    cardMarketUrl: null,
    loading: Boolean(card),
    error: null,
  });

  const cardId = card?.id;
  const localId = card?.localId;
  const setId = card?.set?.id;

  useEffect(() => {
    let cancelled = false;

    if (!card) {
      setState({ prices: {}, cardMarketUrl: null, loading: false, error: null });
      return () => {};
    }

    setState(previous => ({ ...previous, loading: true, error: null }));

    Promise.all([getAllPrices(card), getCardMarketUrl(card)])
      .then(([prices, cardMarketUrl]) => {
        if (!cancelled) {
          setState({ prices, cardMarketUrl, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ prices: {}, cardMarketUrl: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [card, cardId, localId, setId]);

  return state;
}

export function useCollectionPrices(cards) {
  const [state, setState] = useState({ pricesByCardId: {}, loading: false, error: null });
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const cardsKey = cards
    .map(card => `${card.id}:${card.set?.id || ''}:${card.localId || ''}`)
    .join('|');

  useEffect(() => {
    let cancelled = false;

    const currentCards = cardsRef.current;

    if (currentCards.length === 0) {
      setState({ pricesByCardId: {}, loading: false, error: null });
      return () => {};
    }

    setState(previous => ({ ...previous, loading: true, error: null }));

    Promise.all(currentCards.map(async card => [card.id, await getAllPrices(card)]))
      .then(entries => {
        if (!cancelled) {
          setState({ pricesByCardId: Object.fromEntries(entries), loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ pricesByCardId: {}, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardsKey]);

  return state;
}