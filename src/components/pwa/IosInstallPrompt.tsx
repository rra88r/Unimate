"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Share, PlusSquare, X, Smartphone, Download, GraduationCap, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function IosInstallPrompt() {
  const { t, isRtl } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isIpad, setIsIpad] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running as installed standalone PWA
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    if (standaloneMode) {
      return; // Already installed, no need to prompt
    }

    const ua = window.navigator.userAgent;
    const isIpadDevice =
      /iPad/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isIosDevice = /iPhone|iPod/.test(ua) || isIpadDevice;

    setIsIos(isIosDevice);
    setIsIpad(isIpadDevice);

    // Listen for custom event to manually open prompt (e.g. from Settings or Header)
    const handleManualOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("unimate:open-install-prompt", handleManualOpen);

    // Standard Chromium / Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If user hasn't dismissed before, we can show prompt
      const dismissed = localStorage.getItem("unimate_install_dismissed");
      if (!dismissed) {
        setIsOpen(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check previous dismissal for iOS prompt
    const dismissed = localStorage.getItem("unimate_install_dismissed");
    if (isIosDevice && !dismissed) {
      // Small delay so user sees the page load first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("unimate:open-install-prompt", handleManualOpen);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("unimate_install_dismissed", Date.now().toString());
    }
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsOpen(false);
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("pwaInstallTitle")}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {t("pwaInstallTitle")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("pwaInstallSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Body */}
        {isIos ? (
          <div className="space-y-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              {isIpad ? "خطوات التثبيت على iPad (Safari)" : "خطوات التثبيت على iPhone (Safari)"}
            </div>

            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 flex-1">
                <span>{t("pwaInstallIosStep1")}</span>
                <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                  <Share className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {isIpad ? "(في الزاوية العلوية للمتصفح)" : "(في أسفل شاشة المتصفح)"}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 flex-1">
                <span>{t("pwaInstallIosStep2")}</span>
                <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 font-semibold">
                  <PlusSquare className="w-3.5 h-3.5 me-1" /> Add to Home Screen
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 flex-1">
                <span>{t("pwaInstallIosStep3")}</span>
                <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 font-semibold">
                  إضافة / Add
                </span>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-2xl border border-brand-200 dark:border-brand-900/60 text-center space-y-3">
            <Smartphone className="w-8 h-8 text-brand-600 dark:text-brand-400 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isRtl
                ? "يمكنك الآن تثبيت UniMate كتطبيق مستقل على جهازك بضغطة زر واحدة."
                : "You can install UniMate as a standalone app on your device with one click."}
            </p>
            <button
              onClick={handleNativeInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t("pwaInstallButton")}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="font-semibold text-slate-800 dark:text-white">
              {isRtl ? "ميزات تثبيت التطبيق المستقل:" : "Standalone App Features:"}
            </p>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isRtl ? "تجربة شاشة كاملة بدون شريط المتصفح" : "Full screen standalone view without browser bars"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isRtl ? "أداء سريع ووصول فوري من شاشة الجهاز الرئيسية" : "Fast performance with instant home screen access"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isRtl ? "دعم كامل للمس وملاءمة أبعاد iPhone و iPad" : "Full touch optimization for iPhone and iPad"}</span>
              </li>
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            {t("pwaInstallDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
