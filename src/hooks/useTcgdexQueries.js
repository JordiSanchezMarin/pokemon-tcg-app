import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCard, getSet, listSets, searchCards } from '../api/tcgdex';

export function useSetsQuery() {
  return useQuery({
    queryKey: ['tcgdex', 'sets'],
    queryFn: listSets,
  });
}

export function useSetQuery(setId) {
  return useQuery({
    queryKey: ['tcgdex', 'set', setId],
    queryFn: () => getSet(setId),
    enabled: Boolean(setId),
  });
}

export function useCardQuery(cardId) {
  return useQuery({
    queryKey: ['tcgdex', 'card', cardId],
    queryFn: () => getCard(cardId),
    enabled: Boolean(cardId),
  });
}

export function useCardSearchQuery(filters, itemsPerPage) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const { setName, pokemonName, localId, page } = filters;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters({ setName, pokemonName, localId, page });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [setName, pokemonName, localId, page]);

  return useQuery({
    queryKey: ['tcgdex', 'cards', debouncedFilters, itemsPerPage],
    queryFn: () => searchCards({ ...debouncedFilters, itemsPerPage }),
    placeholderData: previousData => previousData,
  });
}