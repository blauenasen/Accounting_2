// src/lib/actions/tip.ts
// Simple Svelte Action for tooltips from SQLite
// Usage in template: <button use:tip={'btn.reload'}>?</button>

import { get } from 'svelte/store';
import { language } from '$lib/settings';

interface TooltipRow {
  key: string;
  en: string;
  de: string;
  category: string;
  active: boolean;
  updated_at: string;
}

interface ActionReturn {
  update: (newVal: string) => void;
  destroy: () => void;
}

const cache = new Map<string, TooltipRow>();
const instancesByKey = new Map<string, Set<() => Promise<void>>>();

function hasContent(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return Boolean(value);
}

function registerInstance(
  key: string,
  apply: () => Promise<void>
): void {
  if (!key) return;
  let set = instancesByKey.get(key);
  if (!set) {
    set = new Set();
    instancesByKey.set(key, set);
  }
  set.add(apply);
}

function unregisterInstance(
  key: string,
  apply: () => Promise<void>
): void {
  if (!key) return;
  const set = instancesByKey.get(key);
  if (!set) return;
  set.delete(apply);
  if (set.size === 0) {
    instancesByKey.delete(key);
  }
}

async function fetchOne(key: string): Promise<TooltipRow | null> {
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) || null;

  try {
    const res = await fetch('/api/tooltips?key=' + encodeURIComponent(key));
    if (!res.ok) return null;

    const row = await res.json() as TooltipRow | null;
    if (!row) {
      cache.delete(key);
      return null;
    }

    if (hasContent(row.en) || hasContent(row.de)) {
      cache.set(key, row);
    } else {
      cache.delete(key);
    }

    return row;
  } catch {
    return null;
  }
}

function resolveText(row: TooltipRow | null, langVal: number): string {
  if (!row) return '';
  const useDe = Number(langVal || 1) === 2;
  return useDe ? (row.de || '') : (row.en || '');
}

export function tip(node: HTMLElement, value: string): ActionReturn {
  let key = typeof value === 'string' ? value : '';
  node.dataset.tipKey = key;

  const apply = async (): Promise<void> => {
    if (!key) {
      node.removeAttribute('title');
      node.removeAttribute('aria-description');
      return;
    }

    const row = await fetchOne(key);
    const text = resolveText(row, get(language)) || key; // Fallback: key
    if (text) {
      node.setAttribute('title', text);
      node.setAttribute('aria-description', text);
    } else {
      node.removeAttribute('title');
      node.removeAttribute('aria-description');
    }
  };

  if (key) {
    registerInstance(key, apply);
  }
  void apply();
  const unsub = language.subscribe(() => {
    void apply();
  });

  return {
    update(newVal: string): void {
      const nextKey = typeof newVal === 'string' ? newVal : '';
      if (nextKey === key) {
        void apply();
        return;
      }

      if (key) {
        unregisterInstance(key, apply);
      }

      key = nextKey;
      node.dataset.tipKey = key;

      if (key) {
        registerInstance(key, apply);
      }

      void apply();
    },
    destroy(): void {
      unsub();
      if (key) {
        unregisterInstance(key, apply);
      }
      node.removeAttribute('title');
      node.removeAttribute('aria-description');
      delete node.dataset.tipKey;
    }
  };
}

export function invalidateTipCache(key: string): void {
  if (!key) return;
  cache.delete(key);
  const instances = instancesByKey.get(key);
  if (instances && instances.size) {
    instances.forEach((apply) => {
      void apply();
    });
  }
}
