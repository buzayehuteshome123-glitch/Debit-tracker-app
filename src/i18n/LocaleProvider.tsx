import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting, setSetting } from '../db/settings';
import type { Locale } from '../types';
import { translations, type TranslationKey } from './translations';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_SETTING_KEY = 'locale';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSetting(db, LOCALE_SETTING_KEY).then((value) => {
      if (mounted && (value === 'en' || value === 'am')) {
        setLocaleState(value);
      }
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [db]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      setSetting(db, LOCALE_SETTING_KEY, next).catch(() => {});
    },
    [db]
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const entry = translations[key];
      let text: string = entry ? entry[locale] : key;
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        }
      }
      return text;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, ready }), [locale, setLocale, t, ready]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
