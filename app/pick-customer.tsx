import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { CustomerCard } from '../src/components/CustomerCard';
import { EmptyState } from '../src/components/EmptyState';
import { useLocale } from '../src/i18n/LocaleProvider';
import { listCustomers } from '../src/db/customers';
import { colors, radius, spacing } from '../src/theme';
import type { CustomerWithBalance } from '../src/types';

export default function PickCustomerScreen() {
  const { action } = useLocalSearchParams<{ action: 'debt' | 'payment' }>();
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(
    async (query: string) => {
      setCustomers(await listCustomers(db, { search: query }));
      setLoaded(true);
    },
    [db]
  );

  useFocusEffect(
    useCallback(() => {
      load(search);
    }, [load, search])
  );

  const handleSelect = (customerId: string) => {
    router.push({
      pathname: action === 'payment' ? '/payment/new' : '/debt/new',
      params: { customerId },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: action === 'payment' ? t('record_payment') : t('add_debt') }} />
      <ScreenContainer scroll={false}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              load(text);
            }}
            autoFocus
          />
        </View>

        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <CustomerCard customer={item} onPress={() => handleSelect(item.id)} />}
          ListEmptyComponent={
            loaded ? (
              <EmptyState
                icon="people-outline"
                title={t('no_customers_title')}
                subtitle={t('no_customers_subtitle')}
                actionLabel={`+ ${t('add_customer')}`}
                onAction={() => router.push('/customer/new')}
              />
            ) : null
          }
        />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
});
