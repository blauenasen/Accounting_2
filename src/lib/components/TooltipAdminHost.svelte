<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import TooltipEditorModal from '$lib/components/TooltipEditorModal.svelte';
  import { openTooltipEditor } from '$lib/stores/tooltipEditor';

  let lastHover: EventTarget | null = null;

  function findKey(el: Element | null): string | null {
    while (el) {
      if (el instanceof Element && el.dataset && el.dataset.tipKey) {
        return el.dataset.tipKey;
      }
      el = el.parentElement;
    }
    return null;
  }

  function onMouseMove(e: MouseEvent) {
    lastHover = e.target;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'F8') {
      e.preventDefault();
      const focusEl = document.activeElement;
      const k = findKey(focusEl as Element | null) || findKey(lastHover as Element | null);
      openTooltipEditor(k || '');
    }
  }

  onMount(() => {
    if (!browser) return;
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
  });
</script>

<TooltipEditorModal />
