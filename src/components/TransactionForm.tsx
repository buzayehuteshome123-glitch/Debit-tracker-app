import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField } from './FormField';
import { Button } from './Button';
import { useLocale } from '../i18n/LocaleProvider';
import { parseAmountToCents, formatCents } from '../money';
import { toIsoDate } from '../dateFormat';
import { validateAmountCents, validatePaymentAgainstBalance } from '../business/balance';
import { colors, radius, spacing, fontSize } from '../theme';
import type { PaymentMethod, TransactionType } from '../types';

export interface TransactionFormValues {
  amountCents: number;
  description: string;
  transactionDate: string;
  paymentMethod?: PaymentMethod;
}

interface TransactionFormProps {
  type: TransactionType;
  outstandingBalanceCents?: number;
  initialValues?: {
    amount: string;
    description: string;
    transactionDate: string;
    paymentMethod?: PaymentMethod;
  };
  submitLabel: string;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK', 'OTHER'];

export function TransactionForm({
  type,
  outstandingBalanceCents,
  initialValues,
  submitLabel,
  onSubmit,
}: TransactionFormProps) {
  const { t } = useLocale();
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.transactionDate ?? toIsoDate(new Date()));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialValues?.paymentMethod ?? 'CASH');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedCents = parseAmountToCents(amount);
  const isPayment = type === 'PAYMENT';

  const handleSubmit = async () => {
    const amountValidation = validateAmountCents(parsedCents);
    if (!amountValidation.valid) {
      setAmountError(t(amountValidation.errorKey));
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setDateError(t('error_invalid_date'));
      return;
    }
    if (isPayment && outstandingBalanceCents !== undefined) {
      const balanceValidation = validatePaymentAgainstBalance(parsedCents as number, outstandingBalanceCents);
      if (!balanceValidation.valid) {
        setAmountError(t(balanceValidation.errorKey));
        return;
      }
    }

    setAmountError(null);
    setDateError(null);
    setSaving(true);
    try {
      await onSubmit({
        amountCents: parsedCents as number,
        description,
        transactionDate: date,
        paymentMethod: isPayment ? paymentMethod : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <FormField
        label={`${t('amount')} *`}
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          if (amountError) setAmountError(null);
        }}
        error={amountError}
        keyboardType="decimal-pad"
        placeholder="1500"
        autoFocus
      />
      {parsedCents !== null ? <Text style={styles.amountPreview}>{formatCents(parsedCents)}</Text> : null}

      {isPayment ? (
        <View style={styles.methodContainer}>
          <Text style={styles.methodLabel}>{t('payment_method')}</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((method) => (
              <Pressable
                key={method}
                onPress={() => setPaymentMethod(method)}
                style={[styles.methodChip, paymentMethod === method && styles.methodChipActive]}
              >
                <Text style={[styles.methodChipLabel, paymentMethod === method && styles.methodChipLabelActive]}>
                  {t(method.toLowerCase() as 'cash' | 'bank' | 'other')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <FormField
        label={`${t('description')} (${t('optional')})`}
        value={description}
        onChangeText={setDescription}
        placeholder={t('description')}
      />

      <FormField
        label={t('date')}
        value={date}
        onChangeText={(text) => {
          setDate(text);
          if (dateError) setDateError(null);
        }}
        error={dateError}
        placeholder="YYYY-MM-DD"
        hint={!dateError ? 'YYYY-MM-DD' : undefined}
      />
      <Pressable onPress={() => setDate(toIsoDate(new Date()))} style={styles.todayLink}>
        <Text style={styles.todayLinkText}>{t('today')}</Text>
      </Pressable>

      {outstandingBalanceCents !== undefined && parsedCents !== null ? (
        <View style={styles.balancePreview}>
          <Text style={styles.balancePreviewLabel}>{t('new_balance')}</Text>
          <Text style={styles.balancePreviewValue}>
            {formatCents(isPayment ? outstandingBalanceCents - parsedCents : outstandingBalanceCents + parsedCents)}
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: spacing.sm }}>
        <Button label={submitLabel} onPress={handleSubmit} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  amountPreview: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  methodContainer: { marginBottom: spacing.md },
  methodLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  methodRow: { flexDirection: 'row', gap: spacing.sm },
  methodChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodChipLabel: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
  methodChipLabelActive: { color: colors.white },
  todayLink: { alignSelf: 'flex-start', marginTop: -spacing.sm, marginBottom: spacing.md },
  todayLinkText: { color: colors.primary, fontWeight: '600' },
  balancePreview: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balancePreviewLabel: { color: colors.textMuted, fontWeight: '600' },
  balancePreviewValue: { color: colors.text, fontWeight: '700', fontSize: fontSize.lg },
});
