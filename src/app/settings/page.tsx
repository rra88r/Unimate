"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Button } from "@/components/ui/Button";
import {
  Settings,
  User,
  Building,
  BookOpen,
  GraduationCap,
  Globe,
  Moon,
  Sun,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const { t, isRtl, user, setUser, language, setLanguage, theme, setTheme } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    major: "",
    semester: "",
    gpaScale: 5.0,
    targetGpa: 4.85,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        university: user.university || "",
        major: user.major || "",
        semester: user.semester || "",
        gpaScale: user.gpaScale || 5.0,
        targetGpa: user.targetGpa || (user.gpaScale === 4.0 ? 3.8 : 4.85),
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          gpaScale: parseFloat(String(formData.gpaScale)),
          targetGpa: parseFloat(String(formData.targetGpa)),
          language,
          theme,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSuccessMessage(t("savedSuccessfully"));
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm("هل تريد إعادة ضبط بيانات الحساب التجريبي إلى الحالة الافتراضية؟")) return;
    try {
      const res = await fetch("/api/auth/seed-demo", { method: "POST" });
      if (res.ok) {
        setSuccessMessage(t("resetDemoSuccess"));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("settingsTitle")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("settingsSubtitle")}
          </p>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-sm font-bold animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Academic Profile Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("studentProfile")}
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("emailAddress")}
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("universityName")}
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("majorField")}
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("semesterName")}
                </label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </Card>

          {/* Academic & GPA Preferences Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                إعدادات نظام المعدل التراكمي
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("gpaSystemSetting")}
                </label>
                <select
                  name="gpaScale"
                  value={formData.gpaScale}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="5.0">{t("scale5")}</option>
                  <option value="4.0">{t("scale4")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("targetGpa")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max={formData.gpaScale}
                  name="targetGpa"
                  value={formData.targetGpa}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </Card>

          {/* Interface & Language Preferences Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("appPreferences")}
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Language Switch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("languageSetting")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage("ar")}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                      language === "ar"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    العربية (Arabic - RTL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                      language === "en"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    English (LTR)
                  </button>
                </div>
              </div>

              {/* Theme Switch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t("themeSetting")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                      theme === "light"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{t("lightTheme")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                      theme === "dark"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{t("darkTheme")}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetDemoData}
              icon={<RotateCcw className="w-4 h-4 text-slate-400" />}
            >
              {t("resetDemoData")}
            </Button>

            <Button
              type="submit"
              isLoading={isSaving}
              className="w-full sm:w-auto px-8"
              icon={<Save className="w-4 h-4" />}
            >
              {t("saveSettings")}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
