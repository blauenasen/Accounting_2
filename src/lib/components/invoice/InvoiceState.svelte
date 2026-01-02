<!-- src/lib/components/invoice/InvoiceState.svelte -->
<script lang="ts">
  // Invoice state management - handles data loading and state
  import type {
    InvoiceData,
    InvoicePosition,
    InvoiceTotals,
    DebtorInfo
  } from '$lib/types/ui.js';
  import { toastStore } from '$lib/utils/toast.js';
  import { todayISO, isoToUS } from '$lib/logic/invoice/invoiceFormatting.js';
  import {
    calculateInvoiceTotals,
    recalculatePositions
  } from '$lib/logic/invoice/invoiceCalculations.js';
  import {
    validateHeaderNew as _validateHeaderNew,
    validateHeaderExisting as _validateHeaderExisting,
    canSave,
    canUpdate,
    canSend,
    canHandover,
    canPrint
  } from '$lib/logic/invoice/invoiceValidation.js';

  // Exported state
  export let invoiceData: InvoiceData = {
    id_invoice: null,
    year: '',
    num: '',
    date: '',
    dateISO: '',
    account: null,
    estimateNr1: '',
    estimateNr2: '',
    blocked: false,
    booked: false,
    isNew: true,
    dirty: false,
    headerDirty: false,
    linesDirty: false,
    linesCount: 0
  };

  export let positions: InvoicePosition[] = [];
  export let totals: InvoiceTotals = {
    subtotal: 0,
    gstSum: 0,
    gstPct: 0,
    total: 0
  };
  export let debtor: DebtorInfo = {
    account: null,
    name: '',
    salutation: '',
    adress1: '',
    adress2: '',
    adress3: '',
    email: ''
  };

  // Data sources
  export let debtors: DebtorInfo[] = [];
  export let invoices: unknown[] = [];
  export let estimates: unknown[] = [];

  // UI state
  export let loading: boolean = false;
  export let saving: boolean = false;
  export let statusMsg: string = '';
  export let statusType: 'info' | 'success' | 'error' = 'info';

  /**
   * Load debtors from API
   */
  export async function loadDebtors(): Promise<void> {
    try {
      const response = await fetch('/api/debtors');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      debtors = Array.isArray(data) ? data : [];
    } catch (error) {
      toastStore.error('Failed to load debtors');
      debtors = [];
    }
  }

  /**
   * Load invoices from API
   */
  export async function loadInvoices(): Promise<void> {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      invoices = (Array.isArray(data) ? data : []).map((row: any) => ({
        ...row,
        blocked: Number(row?.blocked ?? row?.locked ?? 0)
      }));
    } catch (error) {
      toastStore.error('Failed to load invoices');
      invoices = [];
    }
  }

  /**
   * Load estimates from API
   */
  export async function loadEstimates(): Promise<void> {
    try {
      const response = await fetch('/api/estimates');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      estimates = Array.isArray(data) ? data : [];
    } catch (error) {
      toastStore.error('Failed to load estimates');
      estimates = [];
    }
  }

  /**
   * Load all data
   */
  export async function loadAllData(): Promise<void> {
    loading = true;
    try {
      await Promise.all([loadDebtors(), loadInvoices(), loadEstimates()]);
    } finally {
      loading = false;
    }
  }

  /**
   * Sync debtor details based on selected account
   */
  export function syncDebtorDetails(): void {
    const found = debtors.find((d) => d.account === invoiceData.account);
    if (found) {
      debtor = {
        account: found.account,
        name: `${found.salutation || ''} ${found.name || ''}`.trim(),
        salutation: found.salutation,
        adress1: found.adress1,
        adress2: found.adress2,
        adress3: found.adress3,
        email: found.email
      };
    } else {
      debtor = {
        account: null,
        name: '',
        salutation: '',
        adress1: '',
        adress2: '',
        adress3: '',
        email: ''
      };
    }
  }

  /**
   * Initialize new invoice form
   */
  export function initNewForm(): void {
    invoiceData = {
      id_invoice: null,
      year: new Date().getFullYear().toString(),
      num: '',
      date: isoToUS(todayISO()),
      dateISO: todayISO(),
      account: null,
      estimateNr1: '',
      estimateNr2: '',
      blocked: false,
      booked: false,
      isNew: true,
      dirty: false,
      headerDirty: false,
      linesDirty: false,
      linesCount: 0
    };
    positions = [];
    totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };
    debtor = {
      account: null,
      name: '',
      salutation: '',
      adress1: '',
      adress2: '',
      adress3: '',
      email: ''
    };
  }

  /**
   * Update totals from positions
   */
  export function updateTotals(): void {
    totals = calculateInvoiceTotals(positions);
    invoiceData.linesCount = positions.length;
  }

  /**
   * Recalculate all positions
   */
  export function recalculateAllPositions(): void {
    positions = recalculatePositions(positions);
    updateTotals();
  }

  /**
   * Set status message
   */
  export function setStatus(msg: string, type: 'info' | 'success' | 'error' = 'info'): void {
    statusMsg = msg;
    statusType = type;
    if (msg) {
      const keep = msg;
      setTimeout(() => {
        if (statusMsg === keep) statusMsg = '';
      }, 3500);
    }
  }

  /**
   * Validate header (new invoice)
   */
  export function validateHeaderNew(): { valid: boolean; errors: string[] } {
    return _validateHeaderNew(invoiceData);
  }

  /**
   * Validate header (existing invoice)
   */
  export function validateHeaderExisting(): { valid: boolean; errors: string[] } {
    return _validateHeaderExisting(invoiceData);
  }

  /**
   * Get validation flags
   */
  export function getValidationFlags(): {
    canSave: boolean;
    canUpdate: boolean;
    canSend: boolean;
    canHandover: boolean;
    canPrint: boolean;
  } {
    return {
      canSave: canSave(invoiceData),
      canUpdate: canUpdate(invoiceData),
      canSend: canSend(invoiceData),
      canHandover: canHandover(invoiceData),
      canPrint: canPrint(invoiceData)
    };
  }

  // Reactive statements
  $: invoiceData.isNew = invoiceData.id_invoice === null;
  $: invoiceData.dirty = !!(invoiceData.headerDirty || invoiceData.linesDirty);

  // Sync debtor when account changes
  $: if (invoiceData.account !== null) {
    syncDebtorDetails();
  } else {
    debtor = {
      account: null,
      name: '',
      salutation: '',
      adress1: '',
      adress2: '',
      adress3: '',
      email: ''
    };
  }
</script>

<!-- This component has no visual output - it's pure logic -->
