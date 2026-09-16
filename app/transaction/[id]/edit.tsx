import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { Button } from '../../../src/components/Button';
import { TransactionForm, type TransactionFormValues } from '../../../src/components/TransactionForm';
import { getCustomer } from '../../../src/db/customers';
import { deleteTransaction, getTransaction, updateTransaction } from '../../../src/db/transactions';
import { formatCentsPlain } from '../../../src/money';
import { useLocale } from '../../../src/i18n/LocaleProvider';
import { colors, spacing, fontSize } from '../../../src/theme';
import type { CustomerWithBalance, Transaction } from '../../../src/types';

export default function EditTransactionScreen() {
  const { id, customerId } = useLocalSearchParams<{ id: string; customerId: string }>();
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getTransaction(db, id), getCustomer(db, customerId)]).then(([txn, cust]) => {
        setTransaction(txn);
        setCustomer(cust);
      });
    }, [db, id, customerId])
  );

  if (!transaction || !customer) {
    return <ScreenContainer />;
  }

  const isPayment = transaction.type === 'PAYMENT';
  const adjustedOutstandingCents = isPayment
    ? customer.balanceCents + transaction.amount_cents
    : customer.balanceCents - transaction.amount_cents;

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      await updateTransaction(db, transaction.id, {
        amountCents: values.amountCents,
        description: values.description,
        transactionDate: values.transactionDate,
        paymentMethod: values.paymentMethod,
      });
      router.back();
    } catch {
      Alert.alert(t('error_generic'));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('delete_transaction_title'), t('delete_transaction_body'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(db, transaction.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: isPayment ? t('payment') : t('debt') }} />
      <ScreenContainer>
        <Text style={styles.customerName}>{customer.name}</Text>
        <TransactionForm
          type={transaction.type}
          outstandingBalanceCents={adjustedOutstandingCents}
          initialValues={{
            amount: formatCentsPlain(transaction.amount_cents),
            description: transaction.description ?? '',
            transactionDate: transaction.transaction_date,
            paymentMethod: transaction.payment_method ?? undefined,
          }}
          submitLabel={t('save')}
          onSubmit={handleSubmit}
        />
        <View style={styles.deleteContainer}>
          <Button label={t('delete')} variant="danger" onPress={handleDelete} />
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  customerName: {
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: fontSize.md,
  },
  deleteContainer: { marginTop: spacing.md },
});
