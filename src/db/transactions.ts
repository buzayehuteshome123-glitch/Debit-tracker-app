import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../id';
import type { PaymentMethod, Transaction, TransactionType, TransactionWithCustomer } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

export interface TransactionInput {
  customerId: string;
  type: TransactionType;
  amountCents: number;
  paymentMethod?: PaymentMethod | null;
  description?: string | null;
  transactionDate: string; // ISO date, e.g. 2026-09-16
}

export async function createTransaction(db: SQLiteDatabase, input: TransactionInput): Promise<Transaction> {
  const id = generateId();
  const timestamp = nowIso();
  const transaction: Transaction = {
    id,
    customer_id: input.customerId,
    type: input.type,
    amount_cents: input.amountCents,
    payment_method: input.type === 'PAYMENT' ? input.paymentMethod ?? 'CASH' : null,
    description: input.description?.trim() || null,
    transaction_date: input.transactionDate,
    created_at: timestamp,
    updated_at: timestamp,
  };
  await db.runAsync(
    `INSERT INTO transactions (id, customer_id, type, amount_cents, payment_method, description, transaction_date, created_at, updated_at)
     VALUES ($id, $customer_id, $type, $amount_cents, $payment_method, $description, $transaction_date, $created_at, $updated_at)`,
    {
      $id: transaction.id,
      $customer_id: transaction.customer_id,
      $type: transaction.type,
      $amount_cents: transaction.amount_cents,
      $payment_method: transaction.payment_method,
      $description: transaction.description,
      $transaction_date: transaction.transaction_date,
      $created_at: transaction.created_at,
      $updated_at: transaction.updated_at,
    }
  );
  await touchCustomer(db, input.customerId);
  return transaction;
}

export async function updateTransaction(
  db: SQLiteDatabase,
  id: string,
  input: Omit<TransactionInput, 'customerId' | 'type'>
): Promise<void> {
  const existing = await db.getFirstAsync<Transaction>(`SELECT * FROM transactions WHERE id = $id`, { $id: id });
  if (!existing) throw new Error('Transaction not found');

  await db.runAsync(
    `UPDATE transactions SET amount_cents = $amount_cents, payment_method = $payment_method,
       description = $description, transaction_date = $transaction_date, updated_at = $updated_at
     WHERE id = $id`,
    {
      $id: id,
      $amount_cents: input.amountCents,
      $payment_method: existing.type === 'PAYMENT' ? input.paymentMethod ?? 'CASH' : null,
      $description: input.description?.trim() || null,
      $transaction_date: input.transactionDate,
      $updated_at: nowIso(),
    }
  );
  await touchCustomer(db, existing.customer_id);
}

export async function deleteTransaction(db: SQLiteDatabase, id: string): Promise<void> {
  const existing = await db.getFirstAsync<Transaction>(`SELECT * FROM transactions WHERE id = $id`, { $id: id });
  await db.runAsync(`DELETE FROM transactions WHERE id = $id`, { $id: id });
  if (existing) await touchCustomer(db, existing.customer_id);
}

export async function getTransaction(db: SQLiteDatabase, id: string): Promise<Transaction | null> {
  return db.getFirstAsync<Transaction>(`SELECT * FROM transactions WHERE id = $id`, { $id: id });
}

export async function listTransactionsForCustomer(
  db: SQLiteDatabase,
  customerId: string
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE customer_id = $customerId
     ORDER BY transaction_date DESC, created_at DESC`,
    { $customerId: customerId }
  );
}

export async function getCustomerTotals(
  db: SQLiteDatabase,
  customerId: string
): Promise<{ totalDebtCents: number; totalPaymentCents: number }> {
  const row = await db.getFirstAsync<{ totalDebtCents: number; totalPaymentCents: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'DEBT' THEN amount_cents ELSE 0 END), 0) AS totalDebtCents,
       COALESCE(SUM(CASE WHEN type = 'PAYMENT' THEN amount_cents ELSE 0 END), 0) AS totalPaymentCents
     FROM transactions WHERE customer_id = $customerId`,
    { $customerId: customerId }
  );
  return row ?? { totalDebtCents: 0, totalPaymentCents: 0 };
}

export interface ActivityFilter {
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

export async function listAllTransactions(
  db: SQLiteDatabase,
  filter: ActivityFilter = {}
): Promise<TransactionWithCustomer[]> {
  const conditions: string[] = [];
  const params: Record<string, SQLiteBindValue> = {};

  if (filter.type) {
    conditions.push('t.type = $type');
    params.$type = filter.type;
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.$limit = filter.limit ?? 50;
  params.$offset = filter.offset ?? 0;

  return db.getAllAsync<TransactionWithCustomer>(
    `SELECT t.*, c.name AS customer_name FROM transactions t
     JOIN customers c ON c.id = t.customer_id
     ${whereClause}
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT $limit OFFSET $offset`,
    params
  );
}

export async function getDashboardTotals(
  db: SQLiteDatabase
): Promise<{ totalDebtCents: number; totalPaymentCents: number; outstandingCents: number }> {
  const row = await db.getFirstAsync<{ totalDebtCents: number; totalPaymentCents: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'DEBT' THEN amount_cents ELSE 0 END), 0) AS totalDebtCents,
       COALESCE(SUM(CASE WHEN type = 'PAYMENT' THEN amount_cents ELSE 0 END), 0) AS totalPaymentCents
     FROM transactions`,
    []
  );
  const totalDebtCents = row?.totalDebtCents ?? 0;
  const totalPaymentCents = row?.totalPaymentCents ?? 0;
  return { totalDebtCents, totalPaymentCents, outstandingCents: totalDebtCents - totalPaymentCents };
}

async function touchCustomer(db: SQLiteDatabase, customerId: string): Promise<void> {
  await db.runAsync(`UPDATE customers SET updated_at = $now WHERE id = $id`, {
    $id: customerId,
    $now: nowIso(),
  });
}
