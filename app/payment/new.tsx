import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Text } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TransactionForm, type TransactionFormValues } from '../../src/components/TransactionForm';
import { getCustomer } from '../../src/db/customers';
import { createTransaction } from '../../src/db/transactions';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { colors, spacing, fontSize } from '../../src/theme';
import type { CustomerWithBalance } from '../../src/types';

export default function NewPaymentScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCustomer(db, customerId).then(setCustomer);
    }, [db, customerId])
  );

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      await createTransaction(db, {
        customerId,
        type: 'PAYMENT',
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

  if (!customer) {
    return <ScreenContainer />;
  }

  return (
    <>
      <Stack.Screen options={{ title: t('record_payment') }} />
      <ScreenContainer>
        <Text style={{ color: colors.textMuted, fontWeight: '600', marginBottom: spacing.md, fontSize: fontSize.md }}>
          {customer.name}
        </Text>
        <TransactionForm
          type="PAYMENT"
          outstandingBalanceCents={customer.balanceCents}
          submitLabel={t('save_payment')}
          onSubmit={handleSubmit}
        />
      </ScreenContainer>
    </>
  );
}
