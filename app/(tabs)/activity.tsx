import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { EmptyState } from '../../src/components/EmptyState';
import { TransactionRow } from '../../src/components/TransactionRow';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { listAllTransactions } from '../../src/db/transactions';
import { formatIsoDate, isToday } from '../../src/dateFormat';
import { colors, radius, spacing, fontSize } from '../../src/theme';
import type { TransactionType, TransactionWithCustomer } from '../../src/types';

type FilterOption = 'ALL' | TransactionType;

export default function ActivityScreen() {
  const db = useSQLiteContext();
  const { t, locale } = useLocale();
  const router = useRouter();

  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [transactions, setTransactions] = useState<TransactionWithCustomer[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (activeFilter: FilterOption) => {
    const results = await listAllTransactions(db, {
      type: activeFilter === 'ALL' ? undefined : activeFilter,
      limit: 200,
    });
    setTransactions(results);
    setLoaded(true);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [load, filter])
  );

  const sections = useMemo(() => {
    const groups = new Map<string, TransactionWithCustomer[]>();
    for (const item of transactions) {
      const existing = groups.get(item.transaction_date) ?? [];
      existing.push(item);
      groups.set(item.transaction_date, existing);
    }
    return Array.from(groups.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({
        title: isToday(date) ? t('today') : formatIsoDate(date, locale),
        data: items,
      }));
  }, [transactions, locale, t]);

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'ALL', label: t('all') },
    { key: 'DEBT', label: t('debt') },
    { key: 'PAYMENT', label: t('payment') },
  ];

  return (
    <ScreenContainer scroll={false}>
      <Text style={styles.title}>{t('activity')}</Text>

      <View style={styles.filterRow}>
        {filters.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setFilter(option.key)}
            style={[styles.filterChip, filter === option.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === option.key && styles.filterLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TransactionRow
              transaction={item}
              customerName={item.customer_name}
              onPress={() => router.push({ pathname: '/customer/[id]', params: { id: item.customer_id } })}
            />
          </View>
        )}
        ListEmptyComponent={loaded ? <EmptyState icon="time-outline" title={t('no_transactions_title')} /> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, padding: spacing.md, paddingBottom: 0 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterLabel: { color: colors.textMuted, fontWeight: '600', fontSize: fontSize.sm },
  filterLabelActive: { color: colors.white },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
});
