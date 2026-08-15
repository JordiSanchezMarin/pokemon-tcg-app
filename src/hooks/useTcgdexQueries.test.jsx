import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCard, listSets } from '../api/tcgdex';
import { useCardQuery, useSetsQuery } from './useTcgdexQueries';

vi.mock('../api/tcgdex', () => ({
  getCard: vi.fn(),
  getSet: vi.fn(),
  listSets: vi.fn(),
  searchCards: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function QueryWrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('TCGdex query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deduplicates simultaneous set requests', async () => {
    const sets = [{ id: 'base1', name: 'Base Set' }];
    listSets.mockResolvedValue(sets);

    const { result } = renderHook(() => ({
      first: useSetsQuery(),
      second: useSetsQuery(),
    }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.first.isSuccess).toBe(true));

    expect(result.current.first.data).toEqual(sets);
    expect(result.current.second.data).toEqual(sets);
    expect(listSets).toHaveBeenCalledTimes(1);
  });

  it('does not request a card without an id', () => {
    const { result } = renderHook(() => useCardQuery(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCard).not.toHaveBeenCalled();
  });
});