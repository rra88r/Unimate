"use client";

import React from "react";
import { WifiOff, RefreshCw, GraduationCap } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function OfflinePage() {
  const { t, isRtl } = useApp();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {isRtl ? "غير متصل بالإنترنت" : "Offline Mode"}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {isRtl ? "انقطع الاتصال بالشبكة" : "Network Disconnected"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isRtl
              ? "أنت تتصفح تطبيق UniMate في وضع عدم الاتصال. لا يمكنك إجراء تغييرات أو مزامنة البيانات حتى تعود للاتصال بالإنترنت."
              : "You are browsing UniMate in offline mode. You cannot make changes or sync data until internet connectivity is restored."}
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isRtl ? "إعادة المحاولة" : "Try Again"}</span>
        </button>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <GraduationCap className="w-4 h-4 text-brand-500" />
          <span>UniMate PWA • {isRtl ? "يوني ميت" : "The Student Companion"}</span>
        </div>
      </div>
    </div>
  );
}
