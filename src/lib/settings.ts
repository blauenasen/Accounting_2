// src/lib/settings.ts
// Global application settings and configuration

import { writable } from 'svelte/store';

// 1 = EN, 2 = DE
export const language = writable<1 | 2>(1);
