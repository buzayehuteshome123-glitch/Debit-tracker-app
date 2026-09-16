import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../id';
import type { Customer, CustomerWithBalance } from '../types';
import { computeBalanceCents } from '../business/balance';

export interface CustomerInput {
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

const BALANCE_SELECT = `
  c.*,
  COALESCE((SELECT SUM(t.amount_cents) FROM transactions t WHERE t.customer_id = c.id AND t.type = 'DEBT'), 0) AS totalDebtCents,
  COALESCE((SELECT SUM(t.amount_cents) FROM transactions t WHERE t.customer_id = c.id AND t.type = 'PAYMENT'), 0) AS totalPaymentCents
`;

function withBalance(row: Customer & { totalDebtCents: number; totalPaymentCents: number }): CustomerWithBalance {
  return {
    ...row,
    balanceCents: computeBalanceCents(row.totalDebtCents, row.totalPaymentCents),
  };
}

export async function createCustomer(db: SQLiteDatabase, input: CustomerInput): Promise<Customer> {
  const id = generateId();
  const timestamp = nowIso();
  const customer: Customer = {
    id,
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    notes: input.notes?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp,
    archived_at: null,
  };
  await db.runAsync(
    `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at, archived_at)
     VALUES ($id, $name, $phone, $address, $notes, $created_at, $updated_at, $archived_at)`,
    {
      $id: customer.id,
      $name: customer.name,
      $phone: customer.phone,
      $address: customer.address,
      $notes: customer.notes,
      $created_at: customer.created_at,
      $updated_at: customer.updated_at,
      $archived_at: customer.archived_at,
    }
  );
  return customer;
}

export async function updateCustomer(
  db: SQLiteDatabase,
  id: string,
  input: CustomerInput
): Promise<void> {
  await db.runAsync(
    `UPDATE customers SET name = $name, phone = $phone, address = $address, notes = $notes, updated_at = $updated_at
     WHERE id = $id`,
    {
      $id: id,
      $name: input.name.trim(),
      $phone: input.phone?.trim() || null,
      $address: input.address?.trim() || null,
      $notes: input.notes?.trim() || null,
      $updated_at: nowIso(),
    }
  );
}

export async function archiveCustomer(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`UPDATE customers SET archived_at = $now, updated_at = $now WHERE id = $id`, {
    $id: id,
    $now: nowIso(),
  });
}

export async function unarchiveCustomer(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`UPDATE customers SET archived_at = NULL, updated_at = $now WHERE id = $id`, {
    $id: id,
    $now: nowIso(),
  });
}

export async function getCustomer(db: SQLiteDatabase, id: string): Promise<CustomerWithBalance | null> {
  const row = await db.getFirstAsync<Customer & { totalDebtCents: number; totalPaymentCents: number }>(
    `SELECT ${BALANCE_SELECT} FROM customers c WHERE c.id = $id`,
    { $id: id }
  );
  return row ? withBalance(row) : null;
}

export async function listCustomers(
  db: SQLiteDatabase,
  options: { search?: string; includeArchived?: boolean } = {}
): Promise<CustomerWithBalance[]> {
  const conditions: string[] = [];
  const params: Record<string, SQLiteBindValue> = {};

  if (!options.includeArchived) {
    conditions.push('c.archived_at IS NULL');
  }
  if (options.search && options.search.trim().length > 0) {
    conditions.push('(c.name LIKE $search OR c.phone LIKE $search)');
    params.$search = `%${options.search.trim()}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<Customer & { totalDebtCents: number; totalPaymentCents: number }>(
    `SELECT ${BALANCE_SELECT} FROM customers c ${whereClause} ORDER BY c.name COLLATE NOCASE ASC`,
    params
  );
  return rows.map(withBalance);
}

export async function countActiveCustomers(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM customers WHERE archived_at IS NULL`,
    []
  );
  return row?.count ?? 0;
}

export async function customerHasTransactions(db: SQLiteDatabase, id: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM transactions WHERE customer_id = $id`,
    { $id: id }
  );
  return (row?.count ?? 0) > 0;
}
