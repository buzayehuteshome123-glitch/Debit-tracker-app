import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import Constants from 'expo-constants';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useLocale } from '../../src/i18n/LocaleProvider';
import { colors, radius, spacing, fontSize } from '../../src/theme';
import { exportTransactionsCsv, shareBackupFile, pickBackupFile, restoreFromBackup } from '../../src/backup';
import type { Locale } from '../../src/types';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { t, locale, setLocale } = useLocale();
  const [busy, setBusy] = useState<string | null>(null);

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } catch {
      Alert.alert(t('error_generic'));
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = () => {
    Alert.alert(t('restore_warning_title'), t('restore_warning_body'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('restore_data'),
        style: 'destructive',
        onPress: () =>
          runAction('restore', async () => {
            const payload = await pickBackupFile();
            if (!payload) return;
            await restoreFromBackup(db, payload);
            Alert.alert(t('restore_data'));
          }),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('settings')}</Text>

      <Section title={t('language')}>
        <View style={styles.languageRow}>
          <LanguageChip label={t('english')} active={locale === 'en'} onPress={() => setLocale('en' as Locale)} />
          <LanguageChip label={t('amharic')} active={locale === 'am'} onPress={() => setLocale('am' as Locale)} />
        </View>
      </Section>

      <Section title={t('backup')}>
        <SettingRow
          icon="document-text-outline"
          label={t('export_csv')}
          loading={busy === 'csv'}
          onPress={() => runAction('csv', () => exportTransactionsCsv(db))}
        />
        <SettingRow
          icon="cloud-upload-outline"
          label={t('backup_data')}
          loading={busy === 'backup'}
          onPress={() => runAction('backup', () => shareBackupFile(db))}
        />
        <SettingRow
          icon="cloud-download-outline"
          label={t('restore_data')}
          loading={busy === 'restore'}
          onPress={handleRestore}
          danger
        />
      </Section>

      <Section title={t('about')}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>{t('app_name')}</Text>
          <Text style={styles.aboutValue}>
            {t('app_version')} {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>
      </Section>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function LanguageChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.languageChip, active && styles.languageChipActive]}>
      <Text style={[styles.languageChipLabel, active && styles.languageChipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  loading,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={styles.settingRow}>
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.settingLabel, danger && { color: colors.danger }]}>{label}</Text>
      {loading ? <Ionicons name="hourglass-outline" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  languageRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  languageChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  languageChipActive: { backgroundColor: colors.primary },
  languageChipLabel: { fontWeight: '600', color: colors.text },
  languageChipLabelActive: { color: colors.white },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  aboutRow: { padding: spacing.md },
  aboutLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  aboutValue: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
});
