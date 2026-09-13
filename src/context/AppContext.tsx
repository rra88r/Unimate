"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, TranslationKey } from "@/lib/i18n/translations";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  university?: string;
  major?: string;
  semester?: string;
  gpaScale: number;
  targetGpa: number;
  language: string;
  theme: string;
}

interface AppContextType {
  language: Language;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  logout: () => Promise<void>;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from storage & current user
  useEffect(() => {
    // 1. Language preference
    const savedLang = localStorage.getItem("unimate_language") as Language | null;
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLanguageState(savedLang);
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }

    // 2. Theme preference
    const savedTheme = localStorage.getItem("unimate_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    }

    // 3. Fetch current user
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            if (data.user.language && (data.user.language === "ar" || data.user.language === "en")) {
              setLanguageState(data.user.language as Language);
              document.documentElement.dir = data.user.language === "ar" ? "rtl" : "ltr";
              document.documentElement.lang = data.user.language;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("unimate_language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("unimate_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    window.location.href = "/login";
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.ar[key] || key;
  };

  const isRtl = language === "ar";

  return (
    <AppContext.Provider
      value={{
        language,
        isRtl,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        user,
        setUser,
        logout,
        t,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
