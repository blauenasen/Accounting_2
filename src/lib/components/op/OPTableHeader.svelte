<!-- OPTableHeader.svelte -->
<!-- Header row for OP table with sorting -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    sort: { column: string };
  }>();

  // Props
  export let sortColumn: string = '';
  export let sortDirection: 'asc' | 'desc' = 'asc';

  function handleSort(column: string) {
    dispatch('sort', { column });
  }

  function getSortIcon(column: string): string {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  }
</script>

<thead>
  <tr>
    <!-- 14 COLUMNS - OP specific (includes Due Date) -->
    <th class="col-id" on:click={() => handleSort('id')}>
      ID {getSortIcon('id')}
    </th>

    <th class="col-pdf" on:click={() => handleSort('pdf')}>
      PDF
    </th>

    <th class="col-w" on:click={() => handleSort('w')}>
      W
    </th>

    <th class="col-x" on:click={() => handleSort('x')}>
      X
    </th>

    <th class="col-t" on:click={() => handleSort('t')}>
      T
    </th>

    <th class="col-gu" on:click={() => handleSort('gu')}>
      GU
    </th>

    <th class="col-doc" on:click={() => handleSort('docNumber')}>
      Doc Number
    </th>

    <th class="col-date" on:click={() => handleSort('date')}>
      Date
    </th>

    <th class="col-due-date" on:click={() => handleSort('dueDate')}>
      Due Date
    </th>

    <th class="col-text" on:click={() => handleSort('bookingText')}>
      Booking Text
    </th>

    <th class="col-price" on:click={() => handleSort('grossPrice')}>
      Gross Price
    </th>

    <th class="col-contra" on:click={() => handleSort('contraAccount')}>
      Contra Account
    </th>

    <th class="col-bunr" on:click={() => handleSort('buNr')}>
      BuNr
    </th>

    <th class="col-bookc" on:click={() => handleSort('bookC')}>
      BookC
    </th>
  </tr>
</thead>

<style>
  thead tr {
    height: 22px;
  }

  th {
    font-size: 13px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    background-color: transparent;
    padding: 1px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    border: 1px solid rgb(221, 221, 221);
  }

  th:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* Column widths - OP specific */
  .col-id { width: 35px; }
  .col-pdf { width: 35px; }
  .col-w { width: 35px; }
  .col-x { width: 35px; }
  .col-t { width: 35px; }
  .col-gu { width: 35px; }
  .col-doc { width: 170px; }
  .col-date { width: 90px; }
  .col-due-date { width: 91px; }
  .col-text { width: 237px; }
  .col-price { width: 102px; }
  .col-contra { width: 102px; }
  .col-bunr { width: 91px; }
  .col-bookc { width: 35px; }
</style>
