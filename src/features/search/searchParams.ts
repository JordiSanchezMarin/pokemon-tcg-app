export interface SearchFilters {
  setName: string;
  pokemonName: string;
  localId: string;
  page: number;
}

const PARAM_NAMES = {
  setName: 'set',
  pokemonName: 'name',
  localId: 'number',
  page: 'page',
} as const satisfies Record<keyof SearchFilters, string>;

export function readSearchFilters(searchParams: URLSearchParams): SearchFilters {
  const parsedPage = Number.parseInt(searchParams.get(PARAM_NAMES.page) || '', 10);

  return {
    setName: searchParams.get(PARAM_NAMES.setName) || '',
    pokemonName: searchParams.get(PARAM_NAMES.pokemonName) || '',
    localId: searchParams.get(PARAM_NAMES.localId) || '',
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function mergeSearchFilters(
  searchParams: URLSearchParams,
  changes: Partial<SearchFilters>,
): URLSearchParams {
  const nextParams = new URLSearchParams(searchParams);

  (Object.entries(changes) as [keyof SearchFilters, SearchFilters[keyof SearchFilters]][])
    .forEach(([filterName, value]) => {
      const paramName = PARAM_NAMES[filterName];
      if (!paramName) return;

      if (value === '' || value === null || value === undefined || (filterName === 'page' && value === 1)) {
        nextParams.delete(paramName);
      } else {
        nextParams.set(paramName, String(value));
      }
    });

  return nextParams;
}