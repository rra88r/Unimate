"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show splash screen once per session to avoid annoying users on subpage navigation
    if (typeof window !== "undefined") {
      const shownThisSession = sessionStorage.getItem("unimate_splash_shown");
      if (shownThisSession) {
        setShow(false);
        return;
      }

      sessionStorage.setItem("unimate_splash_shown", "true");

      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => setShow(false), 400);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-400 ease-out pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center gap-4 animate-scale-up">
        {/* Glowing pulse aura */}
        <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl animate-pulse" />

        {/* Brand Icon */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-2xl shadow-brand-500/40 border border-white/20">
          <GraduationCap className="w-11 h-11" />
        </div>

        {/* Titles */}
        <div className="text-center space-y-1">
          <span className="text-2xl font-black tracking-tight text-white block">
            يوني ميت <span className="text-brand-400 font-extrabold text-xl">UniMate</span>
          </span>
          <span className="text-xs font-medium text-slate-400 block tracking-wide">
            الرفيق الجامعي الذكي • Smart Student Companion
          </span>
        </div>

        {/* Sleek loading bar */}
        <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden mt-3">
          <div className="w-full h-full bg-gradient-to-r from-brand-500 to-indigo-400 animate-[shimmer_1s_infinite]" />
        </div>
      </div>
    </div>
  );
}
