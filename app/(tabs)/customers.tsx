import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CustomerCard } from '../../src/components/CustomerCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { listCustomers } from '../../src/db/customers';
import { colors, radius, spacing, fontSize } from '../../src/theme';
import type { CustomerWithBalance } from '../../src/types';

export default function CustomersScreen() {
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (query: string) => {
    const results = await listCustomers(db, { search: query });
    setCustomers(results);
    setLoaded(true);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load(search);
    }, [load, search])
  );

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('customers')}</Text>
        <Pressable
          onPress={() => router.push('/customer/new')}
          style={styles.addButton}
          accessibilityLabel={t('add_customer')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

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
          accessibilityLabel={t('search_placeholder')}
        />
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push({ pathname: '/customer/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          loaded ? (
            search ? (
              <EmptyState icon="search-outline" title={t('no_search_results')} />
            ) : (
              <EmptyState
                icon="people-outline"
                title={t('no_customers_title')}
                subtitle={t('no_customers_subtitle')}
                actionLabel={`+ ${t('add_customer')}`}
                onAction={() => router.push('/customer/new')}
              />
            )
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
});
