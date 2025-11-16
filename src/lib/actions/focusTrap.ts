// src/lib/actions/focusTrap.ts
// Svelte Action: Keep focus within container (A11y for dialogs/modals)
// Usage: <div use:focusTrap={open}>…</div>  // open = boolean or Store<boolean>
// - Sets initial focus on first focusable element (or container itself with tabindex="-1")
// - Cyclic tabbing within container
// - Optional: closes on Escape via callback ({ onEscape: () => {} })

import type { Readable } from 'svelte/store';

type TrapParam = boolean | Readable<boolean>;

interface FocusTrapConfig {
  active?: TrapParam;
  onEscape?: () => void;
}

interface ActionReturn {
  update: (newParam: FocusTrapConfig | TrapParam) => void;
  destroy: () => void;
}

export function focusTrap(
  node: HTMLElement,
  param: FocusTrapConfig | TrapParam
): ActionReturn {
  let active = false;
  let unsub: (() => void) | null = null;
  let onEscape: (() => void) | null = null;

  // Container should be focusable
  if (!node.hasAttribute('tabindex')) {
    node.setAttribute('tabindex', '-1');
  }

  applyParam(param);

  const handleKeydown = (e: KeyboardEvent): void => {
    if (!active) return;

    if (e.key === 'Escape' && typeof onEscape === 'function') {
      e.stopPropagation();
      e.preventDefault();
      onEscape();
      return;
    }

    if (e.key !== 'Tab') return;

    const tabbables = getTabbables(node);
    if (tabbables.length === 0) {
      e.preventDefault();
      node.focus();
      return;
    }

    const current = document.activeElement as HTMLElement;
    const idx = tabbables.indexOf(current);
    let nextIdx = 0;

    if (e.shiftKey) {
      // backwards
      nextIdx = idx <= 0 ? tabbables.length - 1 : idx - 1;
    } else {
      // forwards
      nextIdx = idx === -1 || idx >= tabbables.length - 1 ? 0 : idx + 1;
    }

    e.preventDefault();
    tabbables[nextIdx]?.focus();
  };

  const handleFocusin = (e: FocusEvent): void => {
    if (!active) return;
    if (!node.contains(e.target as Node)) {
      // Restore focus
      const first = firstTabbable(node) || node;
      first.focus();
    }
  };

  node.addEventListener('keydown', handleKeydown, true);
  document.addEventListener('focusin', handleFocusin);

  // Focus initially when activated
  if (active) focusInitial();

  return {
    update(newParam: FocusTrapConfig | TrapParam): void {
      cleanupSub();
      applyParam(newParam);
      if (active) focusInitial();
    },
    destroy(): void {
      cleanupSub();
      node.removeEventListener('keydown', handleKeydown, true);
      document.removeEventListener('focusin', handleFocusin);
      if (node.getAttribute('tabindex') === '-1') {
        node.removeAttribute('tabindex');
      }
    }
  };

  function focusInitial(): void {
    const el = firstTabbable(node) || node;
    setTimeout(() => el.focus(), 0);
  }

  function applyParam(p: FocusTrapConfig | TrapParam): void {
    if (typeof p === 'object' && p && 'active' in p) {
      const config = p as FocusTrapConfig;
      onEscape = typeof config.onEscape === 'function' ? config.onEscape : null;
      bindActive(config.active);
    } else {
      onEscape = null;
      bindActive(p as TrapParam);
    }
  }

  function bindActive(val: TrapParam | undefined): void {
    if (val && typeof val === 'object' && 'subscribe' in val) {
      unsub = (val as Readable<boolean>).subscribe((v: boolean) => {
        active = !!v;
      });
    } else {
      active = !!val;
    }
  }

  function cleanupSub(): void {
    if (typeof unsub === 'function') {
      unsub();
      unsub = null;
    }
  }
}

function getTabbables(root: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const nodes = Array.from(root.querySelectorAll(selector)).filter(isVisible);
  return nodes as HTMLElement[];
}

function firstTabbable(root: HTMLElement): HTMLElement | null {
  return getTabbables(root)[0] || null;
}

function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
