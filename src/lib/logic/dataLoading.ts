// dataLoading.ts
// Shared data loading utilities for Booking views
// CLAUDE.md compliant: ≤500 lines

/**
 * Parameters for fetching journal data
 */
export interface FetchJournalParams {
  year: number;
  month: number | 'All';
  bookCircle?: number | null;
  account?: number | null;
  filter?: 'open' | 'balanced' | 'all';
}

/**
 * Fetches journal data from specified endpoint
 * @param endpoint - API endpoint to fetch from
 * @param params - Query parameters
 * @returns Array of journal entries or empty array on error
 */
export async function fetchJournalData(
  endpoint: string,
  params: FetchJournalParams
): Promise<any[]> {
  try {
    const urlParams = new URLSearchParams();

    // Always include year and month
    urlParams.set('year', params.year.toString());
    urlParams.set('month', params.month.toString());

    // Optional: Book Circle (only for Primanota)
    if (params.bookCircle !== undefined && params.bookCircle !== null) {
      urlParams.set('bookCircle', params.bookCircle.toString());
    }

    // Optional: Account (for Kontoansicht/OP-Ansicht)
    if (params.account !== undefined && params.account !== null) {
      urlParams.set('account', params.account.toString());
    }

    // Optional: OP Filter (for OP-Ansicht)
    if (params.filter) {
      urlParams.set('filter', params.filter);
    }

    const url = `${endpoint}?${urlParams}`;
    console.log('Fetching journal data from:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      return data.rows || [];
    } else {
      console.error(`Failed to load from ${endpoint}:`, data.error);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}
