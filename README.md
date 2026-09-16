# Debt Tracker (የዕዳ መዝገብ)

A simple, offline-first mobile app for small business owners in Ethiopia to track
customer debt and payments — built with Expo (React Native) + SQLite.

## Core workflow

Add Customer → Record Debt → Customer Pays → Record Payment → Balance Automatically Updates

Outstanding balance is never stored directly — it's always calculated from the
transaction history (`total debt - total payments`), so it can never drift out of
sync. All money is stored as integer cents to avoid floating-point rounding errors.

## Stack

- **Expo Router** (file-based navigation, bottom tabs)
- **expo-sqlite** for local, offline-first storage (no network required)
- **TypeScript**, strict mode
- Custom lightweight i18n (English / Amharic) backed by a `settings` table
- **expo-file-system** / **expo-sharing** / **expo-document-picker** for CSV export and JSON backup/restore

## Project layout

```
app/                     Screens (expo-router file-based routes)
  (tabs)/                Bottom tab screens: dashboard, customers, activity, settings
  customer/               Add/edit/view customer
  debt/, payment/          Add debt / record payment forms
  transaction/[id]/edit    Edit or delete a transaction
  onboarding.tsx           First-launch intro

src/
  db/                     SQLite schema, migrations, and repository functions
  business/               Pure business-logic functions (balance math, validation) — unit tested
  i18n/                   Translation dictionary + locale context
  components/             Shared UI components
  money.ts, dateFormat.ts, id.ts, theme.ts
```

## Running

```
npm install
npm run android   # or: npm run ios
```

## Testing

```
npm run typecheck   # tsc --noEmit
npm test            # unit tests for balance math & validation rules
```

## Data model

- `customers` — id, name, phone, address, notes, created_at, updated_at, archived_at
- `transactions` — id, customer_id, type (`DEBT`/`PAYMENT`), amount_cents, payment_method, description, transaction_date, created_at, updated_at
- `settings` — key/value store for language preference and onboarding state

Archiving a customer hides them from the normal list but never deletes their
transaction history. Deleting or editing a transaction always recalculates the
customer's balance from the remaining transactions.

## Not implemented in V1

Per the product spec, V1 intentionally excludes: cloud sync, login/accounts,
multi-device sync, SMS/WhatsApp reminders, PDF statements, credit limits/due
dates, and full Ethiopian-calendar date conversion (dates are shown in the
Gregorian calendar with localized month names for both languages).
