"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Globe } from "lucide-react";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useApp();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${className}`}
      title={language === "ar" ? "Switch to English" : "التحويل إلى العربية"}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
