import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatCard } from '../../src/components/StatCard';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { TransactionRow } from '../../src/components/TransactionRow';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { archiveCustomer, getCustomer, unarchiveCustomer } from '../../src/db/customers';
import { listTransactionsForCustomer } from '../../src/db/transactions';
import { formatCents } from '../../src/money';
import { colors, radius, spacing, fontSize } from '../../src/theme';
import type { CustomerWithBalance, Transaction } from '../../src/types';

export default function CustomerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const [customerData, txns] = await Promise.all([
      getCustomer(db, id),
      listTransactionsForCustomer(db, id),
    ]);
    setCustomer(customerData);
    setTransactions(txns);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleArchiveToggle = () => {
    if (!customer) return;
    if (customer.archived_at) {
      unarchiveCustomer(db, customer.id).then(load);
      return;
    }
    Alert.alert(t('archive_customer_title'), t('archive_customer_body'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('archive_customer'),
        style: 'destructive',
        onPress: async () => {
          await archiveCustomer(db, customer.id);
          router.back();
        },
      },
    ]);
  };

  if (!customer) {
    return <ScreenContainer />;
  }

  const isPaid = customer.balanceCents <= 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: customer.name,
          headerRight: () => (
            <Pressable onPress={() => router.push({ pathname: '/customer/[id]/edit', params: { id: customer.id } })}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <ScreenContainer>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{customer.name}</Text>
          {customer.phone ? <Text style={styles.phone}>{customer.phone}</Text> : null}
          {isPaid ? (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>{t('paid')}</Text>
            </View>
          ) : null}
        </View>

        <StatCard label={t('outstanding')} value={formatCents(customer.balanceCents)} emphasis />

        <View style={styles.statsRow}>
          <StatCard label={t('total_debt')} value={formatCents(customer.totalDebtCents)} />
          <StatCard label={t('total_paid')} value={formatCents(customer.totalPaymentCents)} />
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button
              label={`+ ${t('add_debt')}`}
              onPress={() => router.push({ pathname: '/debt/new', params: { customerId: customer.id } })}
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              label={t('record_payment')}
              variant="secondary"
              onPress={() => router.push({ pathname: '/payment/new', params: { customerId: customer.id } })}
            />
          </View>
        </View>

        <Pressable onPress={handleArchiveToggle} style={styles.archiveLink}>
          <Text style={styles.archiveLinkText}>
            {customer.archived_at ? t('unarchive_customer') : t('archive_customer')}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>{t('transaction_history')}</Text>
        {transactions.length === 0 ? (
          <EmptyState icon="receipt-outline" title={t('no_transactions_title')} />
        ) : (
          <View style={styles.card}>
            {transactions.map((item) => (
              <TransactionRow
                key={item.id}
                transaction={item}
                onPress={() =>
                  router.push({
                    pathname: '/transaction/[id]/edit',
                    params: { id: item.id, customerId: customer.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: { alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.white, fontSize: fontSize.xl, fontWeight: '700' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  phone: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 2 },
  paidBadge: {
    backgroundColor: colors.paidBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  paidBadgeText: { color: colors.paidText, fontWeight: '700', fontSize: fontSize.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actionButton: { flex: 1 },
  archiveLink: { alignSelf: 'center', marginTop: spacing.md },
  archiveLinkText: { color: colors.danger, fontWeight: '600' },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
});
