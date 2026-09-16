import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CustomerWithBalance } from '../types';
import { colors, radius, spacing, fontSize } from '../theme';
import { formatCents } from '../money';
import { useLocale } from '../i18n/LocaleProvider';

export function CustomerCard({
  customer,
  onPress,
}: {
  customer: CustomerWithBalance;
  onPress: () => void;
}) {
  const { t } = useLocale();
  const isPaid = customer.balanceCents <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={customer.name}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {customer.name}
        </Text>
        {customer.phone ? (
          <Text style={styles.phone} numberOfLines={1}>
            {customer.phone}
          </Text>
        ) : null}
      </View>
      <View style={styles.balanceArea}>
        {isPaid ? (
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.paidText} />
            <Text style={styles.paidText}>{t('paid')}</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.owedAmount}>{formatCents(customer.balanceCents)}</Text>
            <Text style={styles.owedLabel}>{t('owed')}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: fontSize.md },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  phone: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  balanceArea: { alignItems: 'flex-end' },
  owedAmount: { fontSize: fontSize.md, fontWeight: '700', color: colors.outstandingText },
  owedLabel: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'right' },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paidBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  paidText: { color: colors.paidText, fontWeight: '600', fontSize: fontSize.sm },
});
