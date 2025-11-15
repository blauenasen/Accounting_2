# Accounting 2.0

Complete rewrite of the accounting system with clean architecture, comprehensive testing, and strict adherence to the 500-line rule.

## Project Goals

- ✅ All modules < 500 lines (no exceptions!)
- ✅ 90% test coverage (Unit + Integration)
- ✅ No debug/test code in production
- ✅ Clean folder structure (logic, server, components separated)
- ✅ TypeScript for full type safety
- ✅ Decimal.js for precise calculations
- ✅ Vitest + Playwright for testing

## Technology Stack

- **Framework:** SvelteKit + Svelte 4.x
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3)
- **Testing:** Vitest (unit/integration) + Playwright (e2e)
- **Math:** decimal.js (precision calculations)
- **PDF:** Puppeteer
- **Email:** Nodemailer + IMAPFlow

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Accounting_2
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database path and email credentials.

### 3. Database Setup

Copy the database from Accounting and run migrations:

```bash
# Copy database
cp ../Accounting/db.sqlite ./db.sqlite

# Run migrations (Phase 2)
npm run migrate
```

## Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Type checking
npm run check

# Lint
npm run lint

# Format code
npm run format
```

## Testing

### Unit Tests

```bash
# All unit tests
npm run test tests/unit

# Specific module
npm run test tests/unit/logic/booking
```

### Integration Tests

```bash
npm run test tests/integration
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

## Project Structure

```
src/
├── lib/
│   ├── components/      # UI components (max 500 lines each)
│   │   ├── booking/     # Booking form & Primanota table
│   │   ├── invoice/     # Invoice management
│   │   ├── ledgers/     # Master data
│   │   └── shared/      # Reusable components
│   ├── logic/           # Business logic (NO UI!)
│   │   ├── booking/     # Booking calculations & validation
│   │   ├── primanota/   # Table logic
│   │   ├── invoice/     # Invoice calculations
│   │   └── split/       # Split transactions
│   ├── server/          # Backend logic
│   │   ├── db/          # Database access
│   │   ├── booking/     # Booking endpoints
│   │   └── email/       # Email handling
│   ├── stores/          # Svelte stores
│   ├── utils/           # Utility functions
│   ├── validation/      # Shared validations
│   └── actions/         # Svelte actions
├── routes/              # Pages + API routes
│   ├── api/             # API endpoints
│   └── [pages]/         # Application pages
tests/
├── unit/                # Unit tests (90% coverage goal)
├── integration/         # Integration tests
└── setup.js             # Test setup
```

## Key Features

### Production Features (Migrated)

- **Booking:**
  - BookingForm with account management
  - Primanota table (3 views: Primanota, Account, OP)
  - Book Circle system
  - PDF attachments
  - Split Kreditor/Debitor
  - Reconciliation (Auszifferung)
  - Storno/Cancel bookings
  - Duplicate check
  - Account validation with ranges

- **Invoice:**
  - Create/edit invoices & estimates
  - Position management
  - PDF generation (Puppeteer)
  - Email sending (Nodemailer + IMAP)
  - Handover to booking
  - Status tracking

- **Master Data:**
  - SKR04 accounts
  - Company codes (Buchungskreise)
  - Debtors/Creditors
  - Rates
  - Email configuration

### Removed Features

- Email test routes (selftest, mock, dry-run)
- All console.log statements
- Debug code

## Migration Status

See `ACCOUNTING_2_PLAN.md` for detailed migration plan.

**Current Phase:** Phase 1 - Setup ✅

**Next Phase:** Phase 2 - Database Migration

## Code Quality Rules

### 500-Line Rule

Every module MUST be < 500 lines. Use this as a guideline:

- 🟢 ≤ 300 lines: Good
- 🟡 301-500 lines: OK
- 🔴 > 500 lines: Refactoring required!

### Testing Requirements

- **Booking logic:** 100% coverage
- **Server/DB:** ≥ 80% coverage
- **Validation:** 100% coverage
- **Utils:** ≥ 90% coverage

### TypeScript

- No `any` types (except with justification comment)
- Interfaces for all data structures
- Union types for enums

### Precision Math

Always use decimal.js for financial calculations:

```typescript
import Decimal from 'decimal.js';

// WRONG
const gross = net * 1.07;

// CORRECT
const gross = new Decimal(net).times(1.07).toDecimalPlaces(2).toNumber();
```

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build outputs to `build/` directory with Node adapter.

## Contributing

1. Follow the 500-line rule strictly
2. Write tests for all new features (≥ 90% coverage)
3. Use TypeScript with strict mode
4. Use decimal.js for all financial calculations
5. No console.log statements in production code
6. Follow existing code style (Prettier + ESLint)

## License

Private project - All rights reserved

## Author

Created as part of the Accounting system migration project.

**Version:** 2.0.0
**Last Updated:** 2025-11-15
