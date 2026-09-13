"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  GraduationCap,
  Sparkles,
  Hourglass,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, isRtl, user, logout } = useApp();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/timetable", label: t("navTimetable"), icon: Calendar },
    { href: "/courses", label: t("navCourses"), icon: BookOpen },
    { href: "/assignments", label: t("navAssignments"), icon: CheckSquare },
    { href: "/exams", label: t("navExams"), icon: Clock },
    { href: "/gpa", label: t("navGpa"), icon: GraduationCap },
    { href: "/ai-assistant", label: t("navAiAssistant"), icon: Sparkles, badge: "AI" },
    { href: "/study-planner", label: t("navStudyPlanner"), icon: Hourglass },
    { href: "/settings", label: t("navSettings"), icon: Settings },
  ];

  // Primary items for mobile bottom bar
  const mobileBottomItems = [
    { href: "/dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/timetable", label: t("navTimetable"), icon: Calendar },
    { href: "/assignments", label: t("navAssignments"), icon: CheckSquare },
    { href: "/ai-assistant", label: t("navAiAssistant"), icon: Sparkles },
    { href: "/gpa", label: t("navGpa"), icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white block leading-tight">
                {t("appName")}
              </span>
              <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 block">
                {t("appSubtitle")}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Student Profile and Toggles footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          {/* Quick controls */}
          <div className="flex items-center justify-between px-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* User badge */}
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name ? user.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="truncate text-start">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user.major || user.university}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title={t("navLogout")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header (< md) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white">
            {t("appName")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (When menu opened) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 border-t border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-white text-base">
                {t("appName")} - القائمة الكاملة
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl font-medium text-xs ${
                      isActive
                        ? "bg-brand-600 text-white font-bold"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (iPhone / Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around">
          {mobileBottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.4]" : ""}`} />
                  {item.href === "/ai-assistant" && (
                    <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-1 truncate max-w-[65px] text-center leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
