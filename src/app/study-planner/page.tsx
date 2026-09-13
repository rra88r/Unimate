"use client";

import React, { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Hourglass,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Clock,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function StudyPlannerPage() {
  const { t, isRtl } = useApp();
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayMinutes: 0,
    todaySessionsCount: 0,
    totalMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Pomodoro timer state
  const [timerMode, setTimerMode] = useState<"focus" | "short_break" | "long_break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Log session modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    durationMinutes: 25,
    type: "pomodoro",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [sessRes, coursesRes] = await Promise.all([
        fetch("/api/study-planner"),
        fetch("/api/courses"),
      ]);

      if (sessRes.ok && coursesRes.ok) {
        const sData = await sessRes.json();
        const cData = await coursesRes.json();
        setSessions(sData.sessions || []);
        setStats({
          todayMinutes: sData.todayMinutes || 0,
          todaySessionsCount: sData.todaySessionsCount || 0,
          totalMinutes: sData.totalMinutes || 0,
        });
        setCourses(cData.courses || []);
        if (cData.courses?.length > 0 && !formData.courseId) {
          setFormData((prev) => ({ ...prev, courseId: cData.courses[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  const handleTimerComplete = () => {
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    } catch {}

    if (timerMode === "focus") {
      // Prompt user to save the session
      setFormData((prev) => ({
        ...prev,
        title: "جلسة تركيز بومودورو مكتملة",
        durationMinutes: 25,
      }));
      setIsModalOpen(true);
    }
  };

  const switchMode = (mode: "focus" | "short_break" | "long_break") => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === "focus") setTimeLeft(25 * 60);
    else if (mode === "short_break") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === "focus") setTimeLeft(25 * 60);
    else if (timerMode === "short_break") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({
        title: "",
        courseId: courses[0]?.id || "",
        durationMinutes: 25,
        type: "pomodoro",
        notes: "",
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    try {
      await fetch(`/api/study-planner?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalSeconds =
    timerMode === "focus" ? 25 * 60 : timerMode === "short_break" ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("plannerTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("plannerSubtitle")}
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            {t("logSession")}
          </Button>
        </div>

        {/* 3 Productivity Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{t("sessionCount")}</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.todaySessionsCount}
              </span>
              <span className="text-xs text-slate-400 ms-1.5">جلسات</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{t("totalMinutesStudied")}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.todayMinutes}
              </span>
              <span className="text-xs text-slate-400 ms-1.5">دقيقة اليوم</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">إجمالي وقت الإنجاز</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {(stats.totalMinutes / 60).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 ms-1.5">ساعة تراكمية</span>
            </div>
          </Card>
        </div>

        {/* Pomodoro Interactive Clock Box */}
        <div className="max-w-xl mx-auto">
          <Card className="p-8 text-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-lg">
            {/* Mode Switcher */}
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto">
              <button
                onClick={() => switchMode("focus")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === "focus"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t("focusTime")} (25 د)
              </button>
              <button
                onClick={() => switchMode("short_break")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === "short_break"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t("shortBreak")} (5 د)
              </button>
              <button
                onClick={() => switchMode("long_break")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === "long_break"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t("longBreak")} (15 د)
              </button>
            </div>

            {/* Giant Countdown Digits */}
            <div className="my-8">
              <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
                {timeFormatted}
              </span>
              <div className="w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-36 font-extrabold shadow-lg shadow-brand-600/25"
                icon={
                  isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />
                }
              >
                {isRunning ? t("pause") : t("start")}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={resetTimer}
                icon={<RotateCcw className="w-5 h-5" />}
              >
                {t("reset")}
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Study Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t("recentSessions")}
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {sessions.length} جلسة مسجلة
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-xs text-slate-400">{t("loading")}</div>
            ) : sessions.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                لم تسجل أي جلسات مذاكرة بعد. ابدأ مؤقت بومودورو الآن!
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: session.course?.color || "#6366f1" }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {session.course && (
                          <span className="font-extrabold text-xs text-brand-600 dark:text-brand-400">
                            {session.course.code}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {session.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>
                          ⏱️ {session.durationMinutes} دقيقة • {session.type}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString(
                            isRtl ? "ar-SA" : "en-US",
                            { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-slate-500 italic mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Log Session Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("logSession")}
        >
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("sessionTitle")} *
              </label>
              <input
                type="text"
                required
                placeholder="مراجعة خوارزميات الترتيب والبحث"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المقرر المرتبط (اختياري)
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">بدون ارتباط بمقرر محدد</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {isRtl ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("durationMinutes")} *
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  required
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value) || 25,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الجلسة
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="pomodoro">جلسة بومودورو</option>
                  <option value="revision">مراجعة عامة</option>
                  <option value="assignment_prep">حل واجب أو مشروع</option>
                  <option value="exam_cram">مذاكرة مكثفة لاختبار</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("notes")}
              </label>
              <textarea
                rows={2}
                placeholder="أهم النقاط التي أنجزتها خلال الجلسة..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("save")}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
