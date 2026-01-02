// +page.ts
// Server-side load function for Booking page
// Loads available years from database BEFORE component renders to prevent flickering

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    // Fetch available years from Primanota API
    // We make a minimal request just to get the years array
    const response = await fetch('/api/booking/primanota?year=2025&month=1');

    if (!response.ok) {
      console.error('Failed to load available years from API');
      return {
        availableYears: [],
        initialYear: new Date().getFullYear()
      };
    }

    const data = await response.json();

    // Extract years from API response
    const availableYears: number[] = Array.isArray(data.years) ? data.years : [];

    // Set initial year to highest available year (years are sorted DESC)
    // Fallback to current year if no years available
    const initialYear = availableYears.length > 0
      ? availableYears[0]
      : new Date().getFullYear();

    console.log('[+page.ts] Loaded available years:', availableYears);
    console.log('[+page.ts] Initial year set to:', initialYear);

    return {
      availableYears,
      initialYear
    };
  } catch (error) {
    console.error('[+page.ts] Error loading available years:', error);

    // Fallback to current year if API fails
    return {
      availableYears: [],
      initialYear: new Date().getFullYear()
    };
  }
};
