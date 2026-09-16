export type TransactionType = 'DEBT' | 'PAYMENT';

export type PaymentMethod = 'CASH' | 'BANK' | 'OTHER';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface CustomerWithBalance extends Customer {
  totalDebtCents: number;
  totalPaymentCents: number;
  balanceCents: number;
}

export interface Transaction {
  id: string;
  customer_id: string;
  type: TransactionType;
  amount_cents: number;
  payment_method: PaymentMethod | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCustomer extends Transaction {
  customer_name: string;
}

export type Locale = 'en' | 'am';
