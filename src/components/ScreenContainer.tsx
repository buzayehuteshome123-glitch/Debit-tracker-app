import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenContainerProps {
  children?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
}

export function ScreenContainer({ children, scroll = true, padded = true, refreshControl }: ScreenContainerProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.flex, padded ? styles.padded : undefined]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={padded ? styles.padded : undefined}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  padded: { padding: spacing.md, paddingBottom: spacing.xl },
});
