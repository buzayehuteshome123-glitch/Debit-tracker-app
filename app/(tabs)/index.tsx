import React, { useCallback, useState } from 'react';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatCard } from '../../src/components/StatCard';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { TransactionRow } from '../../src/components/TransactionRow';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { getSetting } from '../../src/db/settings';
import { countActiveCustomers } from '../../src/db/customers';
import { getDashboardTotals, listAllTransactions } from '../../src/db/transactions';
import { formatCents } from '../../src/money';
import { colors, spacing, fontSize } from '../../src/theme';
import type { TransactionWithCustomer } from '../../src/types';

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ totalDebtCents: 0, totalPaymentCents: 0, outstandingCents: 0 });
  const [customerCount, setCustomerCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<TransactionWithCustomer[]>([]);

  const load = useCallback(async () => {
    const [onboardingFlag, dashboardTotals, count, recent] = await Promise.all([
      getSetting(db, 'onboarding_complete'),
      getDashboardTotals(db),
      countActiveCustomers(db),
      listAllTransactions(db, { limit: 6 }),
    ]);
    setNeedsOnboarding(onboardingFlag !== 'true');
    setOnboardingChecked(true);
    setTotals(dashboardTotals);
    setCustomerCount(count);
    setRecentActivity(recent);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!onboardingChecked || loading) {
    return <ScreenContainer />;
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.screenTitle}>{t('dashboard')}</Text>

      <StatCard label={t('total_outstanding')} value={formatCents(totals.outstandingCents)} emphasis />

      <View style={styles.statsRow}>
        <StatCard label={t('total_customers')} value={String(customerCount)} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label={t('total_debt_given')} value={formatCents(totals.totalDebtCents)} />
        <StatCard label={t('total_payments_received')} value={formatCents(totals.totalPaymentCents)} />
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionButton}>
          <Button
            label={`+ ${t('add_debt')}`}
            onPress={() => router.push({ pathname: '/pick-customer', params: { action: 'debt' } })}
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            label={t('record_payment')}
            variant="secondary"
            onPress={() => router.push({ pathname: '/pick-customer', params: { action: 'payment' } })}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
      {recentActivity.length === 0 ? (
        <EmptyState icon="time-outline" title={t('no_transactions_title')} />
      ) : (
        <View style={styles.card}>
          {recentActivity.map((item) => (
            <TransactionRow
              key={item.id}
              transaction={item}
              customerName={item.customer_name}
              onPress={() => router.push({ pathname: '/customer/[id]', params: { id: item.customer_id } })}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: { flex: 1 },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
  },
});
