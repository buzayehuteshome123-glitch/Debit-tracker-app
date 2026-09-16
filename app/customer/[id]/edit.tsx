import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { CustomerForm, type CustomerFormValues } from '../../../src/components/CustomerForm';
import { getCustomer, updateCustomer } from '../../../src/db/customers';
import { useLocale } from '../../../src/i18n/LocaleProvider';
import type { CustomerWithBalance } from '../../../src/types';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCustomer(db, id).then(setCustomer);
    }, [db, id])
  );

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      await updateCustomer(db, id, values);
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
      <Stack.Screen options={{ title: t('edit_customer') }} />
      <ScreenContainer>
        <CustomerForm
          initialValues={{
            name: customer.name,
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            notes: customer.notes ?? '',
          }}
          submitLabel={t('save')}
          onSubmit={handleSubmit}
        />
      </ScreenContainer>
    </>
  );
}
