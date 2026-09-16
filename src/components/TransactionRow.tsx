import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Transaction } from '../types';
import { colors, spacing, fontSize } from '../theme';
import { formatCents } from '../money';
import { formatTimeFromIso } from '../dateFormat';
import { useLocale } from '../i18n/LocaleProvider';

interface TransactionRowProps {
  transaction: Transaction;
  customerName?: string;
  onPress?: () => void;
}

export function TransactionRow({ transaction, customerName, onPress }: TransactionRowProps) {
  const { t, locale } = useLocale();
  const isDebt = transaction.type === 'DEBT';
  const signedCents = isDebt ? transaction.amount_cents : -transaction.amount_cents;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
    >
      <View style={[styles.iconCircle, { backgroundColor: isDebt ? colors.outstandingBackground : colors.paidBackground }]}>
        <Ionicons
          name={isDebt ? 'arrow-up' : 'arrow-down'}
          size={16}
          color={isDebt ? colors.debt : colors.payment}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {customerName ?? (isDebt ? t('debt') : t('payment'))}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {transaction.description || (isDebt ? t('debt') : t('payment'))}
          {'  ·  '}
          {formatTimeFromIso(transaction.created_at, locale)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isDebt ? colors.debt : colors.payment }]}>
        {signedCents > 0 ? '+' : ''}
        {formatCents(signedCents)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: fontSize.md, fontWeight: '700', marginLeft: spacing.sm },
});
