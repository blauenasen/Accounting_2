# ACCOUNTING DESIGN SYSTEM
**Extracted from:** Accounting (Original Project)
**Date:** 2025-11-18
**Purpose:** Reference for styling Accounting_2 to match original

---

## TYPOGRAPHY

### Font Family
```css
font-family: Helvetica, Arial, sans-serif;
```
- **Primary:** Helvetica (fallback to Arial)
- **Usage:** All text elements
- **Monospace:** Not defined (use system default for tables/numbers)

### Font Sizes
```css
--font-size-base: 14px;      /* Body text, inputs, table cells */
--font-size-header: 20px;    /* Page headers */
--font-size-button: 14px;    /* Button text (inherits base) */
```

### Font Weights
```css
--font-weight-normal: normal;  /* Body text */
--font-weight-bold: bold;      /* Headers, labels, buttons, table headers */
```

---

## COLOR PALETTE

### Background Colors
```css
--bg-body: #f7f4ef;           /* Beige - Main background */
--bg-table-container: #f7f4ef; /* Same as body for table scrollable area */
--bg-table-header: #f4f4f4;    /* Light gray - Sticky table headers */
```

### Border Colors
```css
--border-container: #ccc;      /* Container borders (medium gray) */
--border-table: #ddd;          /* Table cell borders (lighter gray) */
```

### Text Colors
```css
--text-primary: #000;          /* Black - All text */
```

### Interactive States
```css
/* Buttons */
button:hover {
  filter: brightness(0.95);    /* Slightly darker on hover */
}

button:disabled {
  opacity: 0.7;                /* 70% opacity when disabled */
  cursor: default;
}
```

---

## SPACING SYSTEM

### Margins (Observed patterns)
```css
--margin-page-header: 50px;    /* Header from left edge */
--margin-inputs: 52px;         /* Input container from left */
--margin-button-group: 250px;  /* Button container from left */
--margin-table-left: 60px;     /* Table container from left edge */
--margin-top-small: 20px;      /* Between sections */
```

### Padding
```css
--padding-input: 5px;          /* Input fields */
--padding-button-y: 6px;       /* Buttons vertical */
--padding-button-x: 18px;      /* Buttons horizontal */
--padding-table-cell: 8px;     /* Table headers/cells */
```

### Gaps
```css
--gap-form-fields: 5px;        /* Between form fields */
```

---

## LAYOUT PATTERNS

### Page Structure
```
┌─────────────────────────────────────┐
│ Header (h1, margin-left: 50px)     │ ← top: 50px, font-size: 20px
├─────────────────────────────────────┤
│ Input Form (margin-left: 52px)     │ ← margin-top: 20px
│   [Field] [Field] [Field] ...      │ ← display: flex, gap: 5px
├─────────────────────────────────────┤
│ Buttons (margin-left: 250px)       │ ← margin-bottom: 20px
│   [Save] [Delete] [Cancel]         │
├─────────────────────────────────────┤
│ Table Container                     │ ← position: absolute
│   ┌───────────────────────────┐    │   top: 225-265px
│   │ Sticky Header             │    │   left: 60px
│   ├───────────────────────────┤    │   overflow-y: auto
│   │ Scrollable Rows           │    │   border: 1px solid #ccc
│   │ ...                       │    │   background: #f7f4ef
│   └───────────────────────────┘    │
└─────────────────────────────────────┘
```

### Table Container Dimensions
```css
/* Rates */
.rates-table-container {
  width: 790px;
  height: 700px;
  top: 225px;
}

/* Debtors */
.debtors-table-container {
  width: 1365px;
  height: 700px;
  top: 265px;
}

/* Creditors */
.creditors-table-container {
  width: 1140px;
  height: 700px;
  top: 265px;
}
```

**Pattern:** Fixed height (700px), width varies by content

---

## COMPONENT STYLES

### Buttons
```css
button {
  display: inline-block;
  padding: 6px 18px;
  font-weight: bold;
  line-height: 1.2;
  cursor: pointer;
  outline: none;
  /* Border/background colors not specified - use browser defaults or custom */
}

button:hover {
  filter: brightness(0.95);
}

button:disabled {
  opacity: 0.7;
  cursor: default;
}
```

### Input Fields
```css
input {
  padding: 5px;
  /* Border/background not specified */
}

/* Alignment patterns */
input[type="number"].center {
  text-align: center;
}

input[type="number"].right {
  text-align: right;
}
```

### Select Dropdowns
```css
select {
  padding: 5px;
  width: 140px;  /* Default, varies by use case */
}
```

### Form Labels
```css
label {
  display: flex;
  flex-direction: column;  /* Label above input */
  font-weight: bold;
  text-align: left;        /* Default, can be overridden */
}
```

### Tables
```css
/* Table container */
.table-container {
  position: absolute;
  top: 225px;              /* Or 265px for forms with more inputs */
  left: 60px;
  width: 790px;            /* Varies by content */
  height: 700px;           /* Fixed */
  overflow-y: auto;
  border: 1px solid #ccc;
  background-color: #f7f4ef;
}

/* Table headers (sticky) */
th {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #f4f4f4;
  color: #000;
  font-weight: bold;
  padding: 8px;
  border: 1px solid #ddd;
  user-select: none;
}

/* Table cells */
td {
  padding: 8px;
  border: 1px solid #ddd;
}

/* Column alignment */
td.center {
  text-align: center;
}

td.right {
  text-align: right;
}
```

---

## FORM PATTERNS

### Standard Form Layout
```html
<div class="page-header">
  Header Text
</div>

<div class="page-inputs">
  <label>
    <span>Field Name</span>
    <input type="text" />
  </label>
  <!-- More fields -->
</div>

<div class="button-container">
  <button>Save</button>
  <button>Delete</button>
  <button>Cancel</button>
</div>

<div class="table-container">
  <table>
    <thead><!-- Sticky header --></thead>
    <tbody><!-- Scrollable rows --></tbody>
  </table>
</div>
```

### CSS Classes Naming Convention
```
{page-name}-{element-type}

Examples:
- rates-header
- rates-inputs
- rates-button-container
- rates-table-container
- debtors-header
- debtors-inputs
```

---

## SPECIFIC FIELD WIDTHS

### Rates Page
```css
Service:      230px
Description:  180px
Qty:          45px  (center aligned)
Rate:         90px  (right aligned)
```

### Debtors/Creditors Pages
```css
Account:      80px
Salutation:   70px
Name:         200px
Address 1-3:  200px
E-Mail:       200px  (debtors only)
Contra Acc:   110px
Acc Selection:125px
Blocked:      55px
```

---

## TABLE COLUMN WIDTHS

### Rates Table
```css
ID:          50px   (center)
Service:     270px  (left)
Description: 200px  (left)
Qty:         50px   (center)
Rate:        100px  (right)
```

### Debtors Table
```css
Account:     50px   (center)
Info:        230px  (left)
...additional columns vary
```

### Creditors Table
```css
Account:     50px   (center)
Info:        230px  (left)
...additional columns vary
```

---

## KEY OBSERVATIONS

### Layout Strategy
- **Absolute positioning** for fixed layouts
- **Flex layouts** for form fields (horizontal alignment)
- **Sticky headers** for table scrolling

### Responsive Design
- **Not implemented** - Fixed pixel widths throughout
- Designed for desktop/laptop screens
- Minimum width: ~1400px for widest tables

### Styling Approach
- **Page-specific CSS files** (no global stylesheet)
- **Inline styles** avoided
- **BEM-like naming** (component-element)

### Browser Compatibility
- Standard CSS3 features only
- No vendor prefixes
- No CSS variables (uses literal values)

---

## MIGRATION STRATEGY FOR ACCOUNTING_2

### Phase 1: CSS Variables
Convert literal values to CSS Custom Properties for maintainability:

```css
:root {
  /* Colors */
  --color-bg-body: #f7f4ef;
  --color-bg-table-header: #f4f4f4;
  --color-border-container: #ccc;
  --color-border-table: #ddd;
  --color-text-primary: #000;

  /* Typography */
  --font-family-base: Helvetica, Arial, sans-serif;
  --font-size-base: 14px;
  --font-size-header: 20px;
  --font-weight-normal: normal;
  --font-weight-bold: bold;

  /* Spacing */
  --spacing-xs: 5px;
  --spacing-sm: 8px;
  --spacing-md: 20px;
  --spacing-lg: 50px;
  --spacing-xl: 60px;

  /* Component Sizing */
  --table-height: 700px;
  --input-padding: 5px;
  --button-padding-y: 6px;
  --button-padding-x: 18px;
}
```

### Phase 2: Component Classes
Create reusable component classes:

```css
.page-header { /* Shared header styles */ }
.page-inputs { /* Shared form layout */ }
.btn { /* Base button styles */ }
.table-container { /* Base table container */ }
```

### Phase 3: Svelte Component Styles
Scope styles to components while maintaining visual consistency

---

## RECOMMENDATIONS

### Keep from Original
✅ Color scheme (beige background works well)
✅ Typography (Helvetica is clean)
✅ Sticky table headers
✅ Disabled button states
✅ Consistent spacing patterns

### Consider Improving
⚠️ Convert to CSS variables for maintainability
⚠️ Add responsive breakpoints
⚠️ Use relative units (rem) instead of px
⚠️ Extract common components
⚠️ Add transitions/animations
⚠️ Improve accessibility (focus states)

---

**Generated:** 2025-11-18
**Tool:** Claude (Sonnet 4.5)
**Source:** Accounting original project analysis
