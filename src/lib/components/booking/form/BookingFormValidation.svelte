<!-- src/lib/components/booking/form/BookingFormValidation.svelte -->
<script lang="ts">
  // Booking form validation logic component
  import { createEventDispatcher } from 'svelte';
  import type { BookingFormData } from '$lib/types/ui.js';
  import { calculateTaxDetails } from '$lib/logic/booking/taxCalculations.js';
  import Decimal from 'decimal.js';

  const dispatch = createEventDispatcher<{
    validated: { payload: Record<string, unknown>; errors: string[] };
  }>();

  // Props
  export let formData: BookingFormData;
  export let selectedBookCircle: { no: number; textcode?: string } | null = null;
  export let currentMonth: string | null = null;
  export let currentYear: string | null = null;

  /**
   * Validates the booking form
   * @returns Array of validation error messages
   */
  export function validateForm(): string[] {
    const errors: string[] = [];

    // Required field validation
    if (!formData.turnover || formData.turnover === '0.00') {
      errors.push('Turnover is required and must be greater than 0');
    }

    if (!formData.contra || formData.contra.trim() === '') {
      errors.push('Contra Account is required');
    }

    if (!formData.date || formData.date.trim() === '') {
      errors.push('Date is required');
    }

    if (!formData.account || formData.account.trim() === '') {
      errors.push('Account is required');
    }

    if (!formData.tax || formData.tax === '?') {
      errors.push('Tax rate is required');
    }

    // Book circle validation
    if (!selectedBookCircle || !selectedBookCircle.no) {
      errors.push('Book Circle is required');
    }

    // Numeric validation
    const contraNum = parseInt(formData.contra, 10);
    if (isNaN(contraNum)) {
      errors.push('Contra Account must be a valid number');
    }

    const accountNum = parseInt(formData.account, 10);
    if (isNaN(accountNum)) {
      errors.push('Account must be a valid number');
    }

    // Date format validation
    if (formData.date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      errors.push('Date must be in format YYYY-MM-DD');
    }

    return errors;
  }

  /**
   * Builds the journal entry payload from form data
   * @returns Journal entry payload for API
   */
  export function buildPayload(): Record<string, unknown> {
    // Parse turnover
    const turnoverStr = String(formData.turnover || '0')
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.');
    const turnoverAbs = parseFloat(turnoverStr) || 0;

    // Calculate Brutto based on SH
    const brutto = formData.sh === 'H' ? -turnoverAbs : turnoverAbs;
    const ue = Math.abs(brutto);

    // Parse BU (Tax rate)
    const bu = formData.tax ? parseFloat(formData.tax) : 0;

    // Calculate tax details using Decimal.js
    const taxCalc = calculateTaxDetails(brutto, bu, formData.sh);

    // Extract date components
    const dateParts = formData.date ? formData.date.split('-') : [];
    const jahr = dateParts.length === 3 ? parseInt(dateParts[0], 10) : new Date().getFullYear();
    const monat = dateParts.length === 3 ? parseInt(dateParts[1], 10) : new Date().getMonth() + 1;
    const tag = dateParts.length === 3 ? parseInt(dateParts[2], 10) : new Date().getDate();

    // Build payload
    const payload: Record<string, unknown> = {
      // Identifiers
      IdNr: formData.idNr || null,
      Jahr: jahr,
      Monat: monat,
      Tag: tag,
      BookCircle: selectedBookCircle?.no || 0,

      // Accounts
      Kto: parseInt(formData.account, 10),
      GegKto: parseInt(formData.contra, 10),

      // Amounts
      UE: ue,
      Brutto: brutto,
      NettoGes: taxCalc.nettoGes,
      VStUSt: taxCalc.VStUSt,
      Steuer: taxCalc.steuer,

      // Tax
      BU: bu,
      SH: formData.sh,

      // References
      BelNr: formData.reference || '',
      Datum: formData.date || '',
      Text: formData.desc || '',

      // Discount
      Skonto: parseFloat(formData.disc.replace('%', '').trim()) || 0,

      // Due date
      FaDatum: formData.due || ''
    };

    return payload;
  }

  /**
   * Public API: Validate and build payload
   */
  export function validateAndBuild(): { valid: boolean; errors: string[]; payload: Record<string, unknown> | null } {
    const errors = validateForm();

    if (errors.length > 0) {
      dispatch('validated', { payload: {}, errors });
      return { valid: false, errors, payload: null };
    }

    const payload = buildPayload();
    dispatch('validated', { payload, errors: [] });
    return { valid: true, errors: [], payload };
  }
</script>

<!-- This component has no visual output - it's pure logic -->
