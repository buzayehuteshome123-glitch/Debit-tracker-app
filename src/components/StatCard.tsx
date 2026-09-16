import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';

interface StatCardProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

export function StatCard({ label, value, emphasis }: StatCardProps) {
  return (
    <View style={[styles.card, emphasis && styles.emphasisCard]}>
      <Text style={[styles.label, emphasis && styles.emphasisLabel]}>{label}</Text>
      <Text style={[styles.value, emphasis && styles.emphasisValue]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  emphasisCard: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emphasisLabel: {
    color: '#DCE9E1',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  emphasisValue: {
    color: colors.white,
    fontSize: fontSize.xxl,
  },
});
