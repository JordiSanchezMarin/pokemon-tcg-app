import { describe, expect, it } from 'vitest';
import { mergeSearchFilters, readSearchFilters } from './searchParams';

describe('search URL parameters', () => {
  it('reads shareable filters and validates the page', () => {
    expect(readSearchFilters(new URLSearchParams('set=base1&name=Gyarados&number=6&page=2'))).toEqual({
      setName: 'base1',
      pokemonName: 'Gyarados',
      localId: '6',
      page: 2,
    });

    expect(readSearchFilters(new URLSearchParams('page=-4'))).toMatchObject({ page: 1 });
    expect(readSearchFilters(new URLSearchParams('page=invalid'))).toMatchObject({ page: 1 });
  });

  it('merges changes and removes default values', () => {
    const current = new URLSearchParams('set=base1&name=Pikachu&page=3');
    const next = mergeSearchFilters(current, { name: 'ignored', pokemonName: '', page: 1, localId: '58' });

    expect(next.toString()).toBe('set=base1&number=58');
  });
});