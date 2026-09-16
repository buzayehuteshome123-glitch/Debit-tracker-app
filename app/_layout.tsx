import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { runMigrations } from '../src/db/migrations';
import { LocaleProvider } from '../src/i18n/LocaleProvider';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="debt_tracker.db" onInit={runMigrations}>
          <LocaleProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.card },
                headerTitleStyle: { color: colors.text },
                headerTintColor: colors.primary,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            </Stack>
          </LocaleProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
