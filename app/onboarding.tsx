import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { useLocale } from '../src/i18n/LocaleProvider';
import { setSetting } from '../src/db/settings';
import { colors, spacing, fontSize } from '../src/theme';
import type { TranslationKey } from '../src/i18n/translations';

const SLIDES: { icon: keyof typeof Ionicons.glyphMap; titleKey: TranslationKey }[] = [
  { icon: 'wallet-outline', titleKey: 'onboarding_title_1' },
  { icon: 'create-outline', titleKey: 'onboarding_title_2' },
  { icon: 'people-circle-outline', titleKey: 'onboarding_title_3' },
];

export default function OnboardingScreen() {
  const db = useSQLiteContext();
  const { t } = useLocale();
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await setSetting(db, 'onboarding_complete', 'true');
    router.replace('/');
  };

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={finish} style={styles.skip}>
        <Text style={styles.skipText}>{t('skip')}</Text>
      </Pressable>

      <View style={styles.content}>
        <Ionicons name={slide.icon} size={96} color={colors.primary} />
        <Text style={styles.title}>{t(slide.titleKey)}</Text>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={isLast ? t('get_started') : t('next')}
          onPress={() => (isLast ? finish() : setIndex(index + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skip: { alignSelf: 'flex-end', padding: spacing.md },
  skipText: { color: colors.textMuted, fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  dots: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  footer: { padding: spacing.lg },
});
