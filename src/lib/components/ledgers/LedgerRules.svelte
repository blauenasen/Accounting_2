<!-- Module: src/lib/components/ledgers/LedgerRules.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  import '$lib/all.css';
  import './ledgers.css';
  import { tip } from '$lib/actions/tip';
  import RuleDialog from './RuleDialog.svelte';
  import ItemDialog from './ItemDialog.svelte';

  export let accountsVersion = 0;
  export let companyCodesVersion = 0;

  const RULES_ENDPOINT = '/api/rules';

  const ACCOUNT_SOURCE_LABELS: Record<string, string> = {
    skr04_accounts: 'SKR04 Accounts',
    debtors: 'Debtors',
    creditors: 'Creditors'
  };

  interface Rule {
    id_rule: number;
    no: number;
    side: string;
    category: string;
    account_min?: number;
    account_max?: number;
    active: boolean;
    description?: string;
    items?: Item[];
  }

  interface Item {
    id_item: number;
    id_rule: number;
    source: string;
    account?: number | string;
    category?: string;
  }

  interface RuleForm {
    id_rule: number | null;
    no: number | null;
    side: string;
    category: string;
    account_min: string | number;
    account_max: string | number;
    active: boolean;
    description: string;
  }

  interface ItemForm {
    id_item: number | null;
    id_rule: number | null;
    source: string;
    account: string;
    category: string;
  }

  interface SourceEntry {
    account?: number;
    designation?: string;
    [key: string]: unknown;
  }

  function createRuleModel(overrides: Partial<Rule> = {}): RuleForm {
    return {
      id_rule: overrides.id_rule ?? null,
      no: overrides.no ?? null,
      side: overrides.side ?? 'HK',
      category: overrides.category ?? '',
      account_min: overrides.account_min ?? '',
      account_max: overrides.account_max ?? '',
      active: overrides.active ?? true,
      description: overrides.description ?? ''
    };
  }

  function createItemModel(overrides: Partial<Item> = {}): ItemForm {
    return {
      id_item: overrides.id_item ?? null,
      id_rule: overrides.id_rule ?? null,
      source: overrides.source ?? 'skr04_accounts',
      account: overrides.account ?? '',
      category: overrides.category ?? ''
    };
  }

  let companyCodes: Array<{ no: number; textcode: string }> = [];
  let selectedBookCircle: number | null = null;
  let rules: Rule[] = [];
  let codesLoading = false;
  let rulesLoading = false;
  let metadataLoading = false;
  let sources: Record<string, SourceEntry[]> = {
    skr04_accounts: [],
    debtors: [],
    creditors: []
  };
  let categoryOptions: string[] = [];
  let ruleDialogVisible = false;
  let ruleDialogMode: 'create' | 'edit' = 'create';
  let ruleForm: RuleForm = createRuleModel();
  let ruleErrors: string[] = [];
  let savingRule = false;
  let itemDialogVisible = false;
  let focusedRule: Rule | null = null;
  let itemForm: ItemForm = createItemModel();
  let itemMode: 'create' | 'edit' = 'create';
  let itemErrors: string[] = [];
  let savingItem = false;
  let isOpen = false;
  let mounted = false;

  const dispatch = createEventDispatcher();

  onMount(async () => {
    const saved = sessionStorage.getItem('ledgers-rules-open');
    isOpen = saved === 'true';
    mounted = true;
    await Promise.all([loadCompanyCodes(), loadMetadata()]);
    if (selectedBookCircle !== null) {
      await loadRules(selectedBookCircle);
    }
  });

  function toggleOpen(): void {
    isOpen = !isOpen;
    sessionStorage.setItem('ledgers-rules-open', String(isOpen));
  }

  let lastAccountsVersion = accountsVersion;
  let lastCodesVersion = companyCodesVersion;

  afterUpdate(() => {
    if (accountsVersion !== lastAccountsVersion) {
      lastAccountsVersion = accountsVersion;
      loadMetadata();
    }
    if (companyCodesVersion !== lastCodesVersion) {
      lastCodesVersion = companyCodesVersion;
      loadCompanyCodes();
    }
  });

  async function loadCompanyCodes(): Promise<void> {
    codesLoading = true;
    try {
      const res = await fetch(`${RULES_ENDPOINT}?scope=codes`);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'CODES_FETCH_FAILED');
      }
      const codes = Array.isArray(data.codes) ? data.codes : [];
      companyCodes = codes.sort((a, b) => a.no - b.no);
      if (companyCodes.length && selectedBookCircle === null) {
        selectedBookCircle = companyCodes[0].no;
      }
    } catch (error) {
      companyCodes = [];
    } finally {
      codesLoading = false;
    }
  }

  async function loadMetadata(): Promise<void> {
    metadataLoading = true;
    try {
      const res = await fetch(`${RULES_ENDPOINT}?scope=sources`);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'SOURCES_FETCH_FAILED');
      }
      sources = {
        skr04_accounts: Array.isArray(data?.sources?.skr04_accounts) ? data.sources.skr04_accounts : [],
        debtors: Array.isArray(data?.sources?.debtors) ? data.sources.debtors : [],
        creditors: Array.isArray(data?.sources?.creditors) ? data.sources.creditors : []
      };
      categoryOptions = Array.isArray(data?.categories) ? data.categories : [];
    } catch (error) {
      sources = { skr04_accounts: [], debtors: [], creditors: [] };
      categoryOptions = [];
    } finally {
      metadataLoading = false;
    }
  }

  async function loadRules(no: number): Promise<void> {
    if (!Number.isFinite(no)) {
      rules = [];
      return;
    }
    rulesLoading = true;
    try {
      const res = await fetch(`${RULES_ENDPOINT}?no=${encodeURIComponent(String(no))}`);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'RULES_FETCH_FAILED');
      }
      rules = Array.isArray(data.rules) ? data.rules : [];
    } catch (error) {
      rules = [];
    } finally {
      rulesLoading = false;
    }
  }

  function handleBookCircleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    if (!Number.isFinite(value)) return;
    selectedBookCircle = value;
    loadRules(value);
  }

  function formatRange(rule: Rule): string {
    const { account_min: min, account_max: max } = rule;
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return `${min} – ${max}`;
    }
    if (Number.isFinite(min)) return `>= ${min}`;
    if (Number.isFinite(max)) return `<= ${max}`;
    return '—';
  }

  function formatActive(rule: Rule): string {
    return rule.active ? 'Active' : 'Inactive';
  }

  function openCreateRule(): void {
    ruleDialogMode = 'create';
    ruleForm = createRuleModel({ no: selectedBookCircle, active: true });
    ruleErrors = [];
    ruleDialogVisible = true;
  }

  function openEditRule(rule: Rule): void {
    ruleDialogMode = 'edit';
    ruleForm = createRuleModel({
      id_rule: rule.id_rule,
      no: rule.no,
      side: rule.side,
      category: rule.category,
      account_min: rule.account_min ?? '',
      account_max: rule.account_max ?? '',
      active: Boolean(rule.active),
      description: rule.description ?? ''
    });
    ruleErrors = [];
    ruleDialogVisible = true;
  }

  function closeRuleDialog(): void {
    ruleDialogVisible = false;
    savingRule = false;
    ruleErrors = [];
  }

  function collectRulePayload(): Record<string, unknown> {
    return {
      action: ruleDialogMode === 'edit' ? 'update-rule' : 'create-rule',
      id_rule: ruleForm.id_rule,
      no: Number(ruleForm.no),
      side: ruleForm.side,
      category: ruleForm.category,
      account_min: ruleForm.account_min === '' ? null : Number(ruleForm.account_min),
      account_max: ruleForm.account_max === '' ? null : Number(ruleForm.account_max),
      active: Boolean(ruleForm.active),
      description: ruleForm.description
    };
  }

  async function submitRule(): Promise<void> {
    savingRule = true;
    ruleErrors = [];
    try {
      const payload = collectRulePayload();
      const res = await fetch(RULES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'RULE_SAVE_FAILED');
      }
      await loadRules(selectedBookCircle ?? 0);
      dispatch('changed');
      closeRuleDialog();
    } catch (error) {
      ruleErrors = [error instanceof Error ? error.message : 'Could not save rule'];
    } finally {
      savingRule = false;
    }
  }

  async function deleteRuleRequest(rule: Rule): Promise<void> {
    if (!rule?.id_rule) return;
    const confirmation = window.confirm('Delete this rule with all items?');
    if (!confirmation) return;
    try {
      const res = await fetch(RULES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-rule', id_rule: rule.id_rule })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'RULE_DELETE_FAILED');
      }
      await loadRules(selectedBookCircle ?? 0);
      dispatch('changed');
      if (itemDialogVisible && focusedRule?.id_rule === rule.id_rule) {
        closeItemDialog();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete rule');
    }
  }

  function openItemDialog(rule: Rule): void {
    focusedRule = rule;
    itemDialogVisible = true;
    itemMode = 'create';
    itemErrors = [];
    itemForm = createItemModel({ id_rule: rule.id_rule, source: 'skr04_accounts' });
  }

  function closeItemDialog(): void {
    itemDialogVisible = false;
    focusedRule = null;
    itemMode = 'create';
    itemErrors = [];
    savingItem = false;
  }

  function resetItemForm(source = 'skr04_accounts'): void {
    itemMode = 'create';
    itemErrors = [];
    itemForm = createItemModel({ id_rule: focusedRule?.id_rule, source });
  }

  function handleItemSourceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    itemForm = { ...itemForm, source: target.value, account: '', category: '' };
  }

  function handleItemAccountChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    itemForm = { ...itemForm, account: target.value, category: target.value ? '' : itemForm.category };
  }

  function handleItemCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    itemForm = { ...itemForm, category: target.value, account: target.value ? '' : itemForm.account };
  }

  function resolveAccountsForSource(source: string): SourceEntry[] {
    return sources?.[source] ?? [];
  }

  async function submitItem(): Promise<void> {
    if (!focusedRule?.id_rule) return;
    savingItem = true;
    itemErrors = [];
    const currentSource = itemForm.source;
    try {
      const payload = {
        action: itemMode === 'edit' ? 'update-item' : 'create-item',
        id_item: itemForm.id_item,
        id_rule: focusedRule.id_rule,
        source: itemForm.source,
        account: itemForm.account === '' ? null : Number(itemForm.account),
        category: itemForm.category
      };
      const res = await fetch(RULES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'RULE_ITEM_SAVE_FAILED');
      }
      await loadRules(selectedBookCircle ?? 0);
      const updatedRule = rules.find((candidate) => candidate.id_rule === focusedRule?.id_rule);
      if (updatedRule) focusedRule = updatedRule;
      resetItemForm(currentSource);
      dispatch('changed');
    } catch (error) {
      itemErrors = [error instanceof Error ? error.message : 'Could not save rule item'];
    } finally {
      savingItem = false;
    }
  }

  async function deleteItemRequest(item: Item): Promise<void> {
    if (!item?.id_item) return;
    const confirmation = window.confirm('Delete this item?');
    if (!confirmation) return;
    try {
      const res = await fetch(RULES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-item', id_item: item.id_item })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'RULE_ITEM_DELETE_FAILED');
      }
      await loadRules(selectedBookCircle ?? 0);
      const updatedRule = rules.find((candidate) => candidate.id_rule === focusedRule?.id_rule);
      if (updatedRule) focusedRule = updatedRule;
      if (itemMode === 'edit' && itemForm.id_item === item.id_item) {
        resetItemForm(itemForm.source);
      }
      dispatch('changed');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not delete rule item');
    }
  }

  function startItemEdit(item: Item): void {
    itemMode = 'edit';
    itemErrors = [];
    itemForm = createItemModel({
      id_item: item.id_item,
      id_rule: item.id_rule,
      source: item.source,
      account: item.account ?? '',
      category: item.category ?? ''
    });
  }

  $: focusedItems = focusedRule?.items ?? [];
  $: availableAccounts = resolveAccountsForSource(itemForm.source);
</script>

<section class="ledger-section" aria-labelledby="ledger-rules-heading">
  <header class="section-header">
    <div>
      <div class="header-title">
        <h2 id="ledger-rules-heading">Regelverwaltung (Rules)</h2>
        <button type="button" class="toggle-btn" on:click={toggleOpen} aria-label="Toggle section">
          {isOpen ? '▼' : '▲'}
        </button>
      </div>
      <p class="section-subtitle">Steuern Sie Kontenbereiche und Ausnahmen pro Book Circle.</p>
    </div>
    <div class="actions">
      <button class="btn-secondary" on:click={openCreateRule} type="button" use:tip={'rules.new'}>Neue Regel</button>
      <span class="hint" aria-live="polite">{#if rulesLoading}Lade Regeln …{/if}</span>
    </div>
  </header>

  {#if mounted && isOpen}
    <section class="controls">
      <label for="ledger-rule-book-circle">Book Circle</label>
      <select
        id="ledger-rule-book-circle"
        bind:value={selectedBookCircle}
        disabled={codesLoading}
        on:change={handleBookCircleChange}
      >
        {#each companyCodes as code}
          <option value={code.no}>{code.no} — {code.textcode}</option>
        {/each}
      </select>
    </section>

    <section class="rules-table-section">
      <table class="rules-table">
        <thead>
          <tr>
            <th>Side</th>
            <th>Category</th>
            <th>Account Range</th>
            <th>Status</th>
            <th>Description</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if !rules.length}
            <tr>
              <td class="empty" colspan="6">Keine Regeln für diesen Book Circle definiert.</td>
            </tr>
          {:else}
            {#each rules as rule}
              <tr>
                <td>{rule.side}</td>
                <td>{rule.category || '—'}</td>
                <td>{formatRange(rule)}</td>
                <td class:inactive={!rule.active}>{formatActive(rule)}</td>
                <td>{rule.description || '—'}</td>
                <td class="col-actions">
                  <button class="btn-secondary" on:click={() => openEditRule(rule)} use:tip={'rules.edit'}>Edit</button>
                  <button class="btn-tertiary" on:click={() => openItemDialog(rule)} use:tip={'rules.items'}>Items</button>
                  <button class="btn-danger" on:click={() => deleteRuleRequest(rule)} use:tip={'rules.delete'}>Delete</button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </section>
  {/if}

  <RuleDialog
    bind:visible={ruleDialogVisible}
    bind:mode={ruleDialogMode}
    bind:form={ruleForm}
    bind:errors={ruleErrors}
    bind:saving={savingRule}
    {companyCodes}
    {categoryOptions}
    on:submit={submitRule}
    on:close={closeRuleDialog}
  />

  <ItemDialog
    bind:visible={itemDialogVisible}
    bind:focusedRule
    bind:itemForm
    bind:itemMode
    bind:itemErrors
    bind:savingItem
    bind:metadataLoading
    {categoryOptions}
    availableAccounts={resolveAccountsForSource(itemForm.source)}
    {focusedItems}
    accountSourceLabels={ACCOUNT_SOURCE_LABELS}
    on:sourcechange={handleItemSourceChange}
    on:accountchange={handleItemAccountChange}
    on:categorychange={handleItemCategoryChange}
    on:submititem={submitItem}
    on:resetform={() => resetItemForm(itemForm.source)}
    on:edititem={(e) => startItemEdit(e.detail)}
    on:deleteitem={(e) => deleteItemRequest(e.detail)}
    on:close={closeItemDialog}
  />
</section>

<style>
  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
  }

  .controls select {
    height: 32px;
    border: 1px solid #cbd5f5;
    border-radius: 4px;
    padding: 0 8px;
    background: #f9fafb;
  }

  .rules-table-section {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .rules-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .rules-table th,
  .rules-table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: left;
  }

  .rules-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }

  .rules-table td.inactive {
    color: #9ca3af;
  }

  .rules-table td.empty {
    padding: 18px;
    text-align: center;
    font-style: italic;
  }

  .col-actions {
    width: 220px;
    text-align: right;
    white-space: nowrap;
  }

  .hint {
    font-size: 12px;
    color: #6b7280;
  }
</style>
