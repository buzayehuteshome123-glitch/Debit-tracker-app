import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Customer, Transaction } from './types';
import { formatCentsPlain } from './money';

function csvEscape(value: string | number | null): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

interface ExportRow {
  customer_name: string;
  phone: string | null;
  type: string;
  amount_cents: number;
  payment_method: string | null;
  description: string | null;
  transaction_date: string;
}

export async function buildTransactionsCsv(db: SQLiteDatabase): Promise<string> {
  const rows = await db.getAllAsync<ExportRow>(
    `SELECT c.name AS customer_name, c.phone AS phone, t.type AS type, t.amount_cents AS amount_cents,
            t.payment_method AS payment_method, t.description AS description, t.transaction_date AS transaction_date
     FROM transactions t
     JOIN customers c ON c.id = t.customer_id
     ORDER BY t.transaction_date ASC, t.created_at ASC`,
    []
  );

  const header = ['Customer Name', 'Phone', 'Transaction Type', 'Amount', 'Payment Method', 'Description', 'Date'];
  const lines = [header.join(',')];

  for (const row of rows) {
    lines.push(
      [
        csvEscape(row.customer_name),
        csvEscape(row.phone),
        csvEscape(row.type),
        csvEscape(formatCentsPlain(row.amount_cents)),
        csvEscape(row.payment_method),
        csvEscape(row.description),
        csvEscape(row.transaction_date),
      ].join(',')
    );
  }

  return lines.join('\n');
}

export async function exportTransactionsCsv(db: SQLiteDatabase): Promise<void> {
  const csv = await buildTransactionsCsv(db);
  const fileUri = `${FileSystem.cacheDirectory}debt-tracker-export-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
  }
}

interface BackupPayload {
  version: 1;
  exportedAt: string;
  customers: Customer[];
  transactions: Transaction[];
}

export async function createBackupFile(db: SQLiteDatabase): Promise<string> {
  const customers = await db.getAllAsync<Customer>('SELECT * FROM customers', []);
  const transactions = await db.getAllAsync<Transaction>('SELECT * FROM transactions', []);

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customers,
    transactions,
  };

  const fileUri = `${FileSystem.cacheDirectory}debt-tracker-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}

export async function shareBackupFile(db: SQLiteDatabase): Promise<void> {
  const fileUri = await createBackupFile(db);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Backup Data' });
  }
}

export class InvalidBackupFileError extends Error {}

export async function pickBackupFile(): Promise<BackupPayload | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new InvalidBackupFileError('Not valid JSON');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as BackupPayload).customers) ||
    !Array.isArray((parsed as BackupPayload).transactions)
  ) {
    throw new InvalidBackupFileError('Missing customers/transactions arrays');
  }

  return parsed as BackupPayload;
}

export async function restoreFromBackup(db: SQLiteDatabase, payload: BackupPayload): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('DELETE FROM transactions;');
    await txn.execAsync('DELETE FROM customers;');

    for (const customer of payload.customers) {
      await txn.runAsync(
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
    }

    for (const transaction of payload.transactions) {
      await txn.runAsync(
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
    }
  });
}
