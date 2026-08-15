const PARAM_NAMES = {
  setName: 'set',
  pokemonName: 'name',
  localId: 'number',
  page: 'page',
};

export function readSearchFilters(searchParams) {
  const parsedPage = Number.parseInt(searchParams.get(PARAM_NAMES.page), 10);

  return {
    setName: searchParams.get(PARAM_NAMES.setName) || '',
    pokemonName: searchParams.get(PARAM_NAMES.pokemonName) || '',
    localId: searchParams.get(PARAM_NAMES.localId) || '',
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function mergeSearchFilters(searchParams, changes) {
  const nextParams = new URLSearchParams(searchParams);

  Object.entries(changes).forEach(([filterName, value]) => {
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