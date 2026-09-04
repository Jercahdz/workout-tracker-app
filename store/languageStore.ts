import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import i18n from "../lib/i18n";

export type AppLocale = "en" | "es";

const LANGUAGE_STORAGE_KEY = "appLanguage";

interface LanguageState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
  loadLocale: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: i18n.locale as AppLocale,

  setLocale: async (locale) => {
    i18n.locale = locale;
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, locale);
    set({ locale });
  },

  loadLocale: async () => {
    const storedLocale = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    if (storedLocale === "en" || storedLocale === "es") {
      i18n.locale = storedLocale;
      set({ locale: storedLocale });
    }
  },
}));