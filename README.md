# Accounting_2

Modern accounting application built with SvelteKit 4, TypeScript, and better-sqlite3.

## Overview

Accounting_2 is a complete rewrite/migration of the original Accounting application, focusing on:
- **Type Safety**: Full TypeScript implementation
- **Code Quality**: Modular architecture with <500 lines per module target
- **Testing**: Comprehensive test coverage (52 tests, 100% passing)
- **Precision**: decimal.js for all monetary calculations
- **Modern Stack**: SvelteKit 4 + Vite + Vitest

## Features

- **Booking Management**: Create, edit, and cancel bookings
- **Invoice System**: Generate invoices with PDF support
- **Ledger Management**: Account management and balancing
- **Creditors/Debtors**: Manage business relationships
- **Primanota**: Journal entry management
- **Split Booking**: Split invoices across multiple accounts
- **Reconciliation**: Match and reconcile entries

## Tech Stack

- **Framework**: SvelteKit 4 (Svelte 4.x)
- **Language**: TypeScript
- **Database**: better-sqlite3 (WAL mode)
- **Testing**: Vitest + Playwright
- **Calculations**: decimal.js (cent-precise)
- **Build**: Vite 5
- **Deployment**: Node adapter

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Accounting_2

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at: \`http://localhost:5173/\` (or next available port)

## Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run all tests
npm run test:coverage # Run tests with coverage

# Code Quality
npm run check        # Run svelte-check
```

### Testing

- **Unit Tests**: 42 tests (100% passing)
- **Integration Tests**: 10 tests (100% passing)
- **Total**: 52 tests

## Database

Uses better-sqlite3 with WAL mode for better concurrency.

Main tables: journal, invoice, invoice_db, debtors, creditors, rates, stammdaten

## Deployment

```bash
npm run build
npm run preview
```

Uses \`@sveltejs/adapter-node\` for Node.js deployment.

## Known Limitations

⚠️ **Work in Progress:**
- Some components are placeholders
- 8 files exceed 500-line target (needs refactoring)

## Version

**2.0.0** - Migration from Accounting v1

---

Built with ❤️ and Claude Code
