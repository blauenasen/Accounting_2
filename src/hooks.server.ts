// File: src/hooks.server.ts
// Server hooks for SvelteKit

import type { Handle } from '@sveltejs/kit';

// Reset account caches on server startup to ensure fresh data
let cacheResetDone = false;

export const handle: Handle = async ({ event, resolve }) => {
  // Reset cache only once on first request after server start
  if (!cacheResetDone) {
    // Initialize cache reset logic here if needed
    cacheResetDone = true;
  }

  return resolve(event);
};
