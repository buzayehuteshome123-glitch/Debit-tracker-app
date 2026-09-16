import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CustomerForm, type CustomerFormValues } from '../../src/components/CustomerForm';
import { createCustomer } from '../../src/db/customers';
import { useLocale } from '../../src/i18n/LocaleProvider';

export default function NewCustomerScreen() {
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      const customer = await createCustomer(db, values);
      router.replace({ pathname: '/customer/[id]', params: { id: customer.id } });
    } catch {
      Alert.alert(t('error_generic'));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('add_customer') }} />
      <ScreenContainer>
        <CustomerForm submitLabel={t('save_customer')} onSubmit={handleSubmit} />
      </ScreenContainer>
    </>
  );
}
