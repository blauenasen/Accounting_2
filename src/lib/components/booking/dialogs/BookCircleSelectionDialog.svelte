<!-- src/lib/components/booking/dialogs/BookCircleSelectionDialog.svelte -->
<script lang="ts">
  // Book Circle selection dialog
  import { createEventDispatcher, onMount, tick } from 'svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    select: { idcode: string | null; no: number | null; textcode: string };
  }>();

  // Props
  export let visible = false;

  // State
  interface BookCircle {
    idcode: string;
    no: number;
    textcode: string;
  }

  let bookCircles: BookCircle[] = [];
  let selectedCircle: BookCircle | null = null;
  let selectedIndex = -1;
  let loading = false;
  let error = '';

  /**
   * Load book circles from API when dialog opens
   */
  $: if (visible) {
    loadBookCircles();
    focusFirstCircle();
  }

  /**
   * Reset state when dialog closes
   */
  $: if (!visible) {
    selectedCircle = null;
    selectedIndex = -1;
    error = '';
  }

  /**
   * Load book circles from API
   */
  async function loadBookCircles(): Promise<void> {
    if (bookCircles.length > 0) {
      // Already loaded
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/booking/bookcircle');
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        bookCircles = data;
      } else {
        error = 'Failed to load book circles';
        console.error('BookCircle API error:', data);
      }
    } catch (err) {
      error = 'Network error loading book circles';
      console.error('BookCircle fetch error:', err);
    } finally {
      loading = false;
    }
  }

  /**
   * Focus first circle in list
   */
  async function focusFirstCircle(): Promise<void> {
    // Only run in browser (not during SSR)
    if (typeof document === 'undefined') return;

    await tick();
    const firstRow = document.querySelector('.book-circle-row') as HTMLElement;
    if (firstRow) {
      firstRow.focus();
    }
  }

  /**
   * Close dialog
   */
  function close(): void {
    dispatch('close');
  }

  /**
   * Handle cancel button
   */
  function handleCancel(): void {
    close();
  }

  /**
   * Handle select button
   */
  function handleSelect(): void {
    if (selectedCircle) {
      dispatch('select', selectedCircle);
      close();
    } else if (selectedIndex === -1) {
      // "no selection" option selected
      dispatch('select', { idcode: null, no: null, textcode: '' });
      close();
    }
  }

  /**
   * Handle circle row click
   */
  function handleCircleClick(circle: BookCircle): void {
    selectedCircle = circle;
    selectedIndex = bookCircles.indexOf(circle);
  }

  /**
   * Handle circle row double-click - select immediately
   */
  function handleCircleDoubleClick(circle: BookCircle): void {
    selectedCircle = circle;
    handleSelect();
  }

  /**
   * Handle "no selection" row click
   */
  function handleNoSelectionClick(): void {
    selectedCircle = null;
    selectedIndex = -1;
  }

  /**
   * Handle "no selection" row double-click - select immediately
   */
  function handleNoSelectionDoubleClick(): void {
    selectedCircle = null;
    dispatch('select', { idcode: null, no: null, textcode: '' });
    close();
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (!visible || bookCircles.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedIndex < bookCircles.length - 1) {
          selectedIndex++;
          selectedCircle = bookCircles[selectedIndex];
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (selectedIndex > 0) {
          selectedIndex--;
          selectedCircle = bookCircles[selectedIndex];
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedCircle) {
          handleSelect();
        }
        break;

      case 'Escape':
        event.preventDefault();
        handleCancel();
        break;
    }
  }

  // Attach keyboard listener when visible
  // Only run in browser (not during SSR)
  $: if (typeof window !== 'undefined') {
    if (visible) {
      window.addEventListener('keydown', handleKeydown);
    } else {
      window.removeEventListener('keydown', handleKeydown);
    }
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={handleCancel}>
    <div class="dialog-container" on:click|stopPropagation>
      <div class="dialog-header">
        <h3>Select Book Circle</h3>
        <button class="close-btn" on:click={handleCancel} title="Close (ESC)">×</button>
      </div>

      <div class="dialog-content">
        {#if loading}
          <div class="loading-message">Loading book circles...</div>
        {:else if error}
          <div class="error-message">{error}</div>
        {:else if bookCircles.length === 0}
          <div class="empty-message">No book circles available</div>
        {:else}
          <div class="circles-list">
            <div class="list-header">
              <div class="col-no">No</div>
              <div class="col-textcode">Name</div>
            </div>
            <!-- No selection option -->
            <div
              class="book-circle-row no-selection-row"
              class:selected={selectedIndex === -1}
              tabindex="0"
              on:click={() => handleNoSelectionClick()}
              on:dblclick={() => handleNoSelectionDoubleClick()}
              on:keydown={(e) => {
                if (e.key === 'Enter') handleNoSelectionDoubleClick();
              }}
            >
              <div class="col-no-selection">-- no selection --</div>
            </div>
            {#each bookCircles as circle, index}
              <div
                class="book-circle-row"
                class:selected={selectedIndex === index}
                tabindex="0"
                on:click={() => handleCircleClick(circle)}
                on:dblclick={() => handleCircleDoubleClick(circle)}
                on:keydown={(e) => {
                  if (e.key === 'Enter') handleCircleDoubleClick(circle);
                }}
              >
                <div class="col-no">{circle.no}</div>
                <div class="col-textcode">{circle.textcode}</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="dialog-footer">
        <button class="btn-cancel" on:click={handleCancel}>Cancel</button>
        <button
          class="btn-select"
          disabled={!selectedCircle && selectedIndex !== -1}
          on:click={handleSelect}
        >
          Select
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog-container {
    background-color: white;
    border: 2px solid #333;
    border-radius: 4px;
    width: 500px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    background-color: #f5f5f5;
  }

  .dialog-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    color: #333;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 300px;
  }

  .loading-message,
  .error-message,
  .empty-message {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    font-size: 14px;
  }

  .error-message {
    color: #d32f2f;
  }

  .circles-list {
    display: flex;
    flex-direction: column;
  }

  .list-header {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 10px;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    font-weight: 600;
    font-size: 13px;
    color: #333;
  }

  .book-circle-row {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-top: none;
    cursor: pointer;
    background-color: white;
    transition: background-color 0.15s;
  }

  .book-circle-row:hover {
    background-color: #f9f9f9;
  }

  .book-circle-row.selected {
    background-color: #e3f2fd;
    border-color: #2196f3;
  }

  .book-circle-row:focus {
    outline: 2px solid #2196f3;
    outline-offset: -2px;
  }

  .col-no {
    font-size: 13px;
    color: #333;
  }

  .col-textcode {
    font-size: 13px;
    color: #555;
  }

  .col-no-selection {
    grid-column: 1 / -1;
    text-align: center;
    font-style: italic;
    color: #666;
    font-size: 13px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #ddd;
    background-color: #f5f5f5;
  }

  .btn-cancel,
  .btn-select {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid #333;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-cancel {
    background-color: white;
    color: #333;
  }

  .btn-cancel:hover {
    background-color: #f5f5f5;
  }

  .btn-select {
    background-color: #4caf50;
    color: white;
    border-color: #4caf50;
  }

  .btn-select:hover:not(:disabled) {
    background-color: #45a049;
  }

  .btn-select:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
