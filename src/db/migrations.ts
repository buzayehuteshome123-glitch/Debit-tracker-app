import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Ordered schema migrations, applied in sequence based on PRAGMA user_version.
 * Never edit a past migration — append a new one instead, so existing installs
 * upgrade safely without losing data.
 */
const migrations: string[] = [
  // 1: initial schema
  `
  CREATE TABLE customers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT
  );

  CREATE TABLE transactions (
    id TEXT PRIMARY KEY NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('DEBT', 'PAYMENT')),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    payment_method TEXT CHECK (payment_method IN ('CASH', 'BANK', 'OTHER')),
    description TEXT,
    transaction_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
  CREATE INDEX idx_transactions_date ON transactions(transaction_date);
  CREATE INDEX idx_customers_name ON customers(name);
  CREATE INDEX idx_customers_phone ON customers(phone);
  `,
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;', []);
  let version = row?.user_version ?? 0;

  for (let i = version; i < migrations.length; i++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migrations[i]);
    });
    version = i + 1;
    await db.execAsync(`PRAGMA user_version = ${version};`);
  }
}
