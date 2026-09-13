"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Sparkles, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function PwaRegister() {
  const { t, isRtl } = useApp();
  const [isOffline, setIsOffline] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Initial online/offline status check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 2. Service Worker registration
      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            // Check for waiting service worker (update ready)
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setHasUpdate(true);
            }

            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setHasUpdate(true);
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("UniMate PWA: Service Worker registration failed", error);
          });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    setHasUpdate(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
            <span>
              <strong>{t("offlineBannerTitle")}:</strong> {t("offlineBannerDesc")}
            </span>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t("offlineRetry")}</span>
          </button>
        </div>
      )}

      {/* PWA Update Ready Banner */}
      {hasUpdate && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 start-4 end-4 md:start-auto md:end-6 max-w-sm z-50 bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-brand-500/40 flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{t("pwaUpdateAvailable")}</p>
              <p className="text-[11px] text-slate-400">UniMate v1.1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
            >
              {t("pwaUpdateAction")}
            </button>
            <button
              onClick={() => setHasUpdate(false)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
