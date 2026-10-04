import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AppLanguage } from './i18n.types';
import { translateStaticText } from './translations';

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (value: string) => string;
};

const languageStorageKey = 'avs:language';
const I18nContext = createContext<I18nContextValue | null>(null);

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem(languageStorageKey) === 'my' ? 'my' : 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(languageStorageKey, nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
  }, [language]);

  const t = useCallback((value: string) => translateStaticText(value, language), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
