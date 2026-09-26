"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import confetti from "canvas-confetti";
import { triggerHapticNotification } from "@/lib/capacitor";

export default function DashboardPage() {
  const { t, isRtl, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleAssignment = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";

    if (nextStatus === "completed") {
      triggerHapticNotification();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {}
    }

    try {
      await fetch(`/api/assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-500">{t("loading")}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const nextExam = data?.upcomingExams?.[0];
  let daysToExam = 0;
  let hoursToExam = 0;
  if (nextExam) {
    const diffMs = new Date(nextExam.examDate).getTime() - new Date().getTime();
    if (diffMs > 0) {
      daysToExam = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      hoursToExam = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
  }

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Student Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>{user?.semester || "الفصل الدراسي الحالي"}</span>
                <span>•</span>
                <span>{user?.university || "جامعة الملك سعود"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t("welcomeBack")} {user?.name || "فيصل"} 👋
              </h1>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                {t("academicOverview")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/ai-assistant">
                <Button
                  size="sm"
                  className="bg-white/90 hover:bg-white text-brand-700 hover:text-brand-800 shadow-sm border-0 font-bold"
                  icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                >
                  {t("askAiBuddy")}
                </Button>
              </Link>
              <Link href="/timetable">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-brand-700/80 hover:bg-brand-800 text-white border-white/20 font-bold"
                  icon={<Calendar className="w-4 h-4" />}
                >
                  {t("viewSchedule")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cumulative GPA Card */}
          <Card className="p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("currentGpa")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {data?.gpaSummary?.cumulativeGpa?.toFixed(2) || "5.00"}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / {data?.gpaSummary?.scale?.toFixed(1) || "5.0"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>{t("targetGpa")}:</span>
                <span>{data?.gpaSummary?.targetGpa?.toFixed(2) || "4.85"}</span>
              </div>
            </div>
          </Card>

          {/* Enrolled Courses Card */}
          <Card className="p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("enrolledCourses")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {data?.coursesCount || 6}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {t("coursesTitle")}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {data?.courses?.reduce((acc: number, c: any) => acc + c.creditHours, 0) || 17}{" "}
                {t("creditHours")}
              </div>
            </div>
          </Card>

          {/* Pending Tasks Card */}
          <Card className="p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("pendingTasks")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {data?.pendingAssignments?.length || 0}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {t("pending")}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {data?.pendingAssignments?.[0]?.title || t("noPendingAssignments")}
              </div>
            </div>
          </Card>

          {/* Next Exam Countdown Card */}
          <Card className="p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("nextExamIn")}
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              {nextExam ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                      {daysToExam}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {t("daysRemaining")}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {nextExam.course?.code} - {nextExam.title}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  لا توجد اختبارات مجدولة قريباً
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes Widget */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white">
                      {t("todayClasses")}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date().toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <Link
                  href="/timetable"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>{t("viewAll")}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {data?.todayClasses && data.todayClasses.length > 0 ? (
                  data.todayClasses.map((slot: any) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full"
                          style={{ backgroundColor: slot.course?.color || "#6366f1" }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {slot.course?.code}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {isRtl ? slot.course?.nameAr : slot.course?.nameEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>{slot.room || "قاعة دراسية"}</span>
                            <span>•</span>
                            <span>{slot.type === "lab" ? t("lab") : t("lecture")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="font-bold text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200/50 dark:border-brand-800/50">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium">{t("noClassesToday")}</p>
                    <p className="text-xs mt-1 text-slate-400">
                      استغل يومك في إنجاز الواجبات المعلقة أو المذاكرة للامتحانات!
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Urgent Assignments Widget */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    {t("urgentAssignments")}
                  </h2>
                </div>

                <Link
                  href="/assignments"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>{t("viewAll")}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {data?.pendingAssignments && data.pendingAssignments.length > 0 ? (
                  data.pendingAssignments.map((assignment: any) => {
                    const isCompleted = assignment.status === "completed";
                    const isDueToday =
                      new Date(assignment.dueDate).toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={assignment.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isCompleted
                            ? "bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 opacity-75"
                            : "bg-white dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleToggleAssignment(assignment.id, assignment.status)
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                isCompleted
                                  ? "text-emerald-600 fill-emerald-100 dark:fill-emerald-950"
                                  : ""
                              }`}
                            />
                          </button>
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                isCompleted
                                  ? "line-through text-slate-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {assignment.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span
                                className="font-bold"
                                style={{ color: assignment.course?.color || "#6366f1" }}
                              >
                                {assignment.course?.code}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(assignment.dueDate).toLocaleDateString(
                                  isRtl ? "ar-SA" : "en-US",
                                  { month: "short", day: "numeric" }
                                )}
                              </span>
                              {assignment.weightPercentage && (
                                <>
                                  <span>•</span>
                                  <span>{assignment.weightPercentage}% من المقرر</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isDueToday ? (
                            <Badge variant="rose">{t("dueToday")}</Badge>
                          ) : assignment.priority === "high" ? (
                            <Badge variant="amber">{t("high")}</Badge>
                          ) : (
                            <Badge variant="slate">{t("medium")}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium">{t("noPendingAssignments")}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Secondary Column (1/3 width) */}
          <div className="space-y-6">
            {/* Upcoming Exams Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    {t("upcomingExamsCard")}
                  </h2>
                </div>
                <Link
                  href="/exams"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {t("viewAll")}
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {data?.upcomingExams && data.upcomingExams.length > 0 ? (
                  data.upcomingExams.map((exam: any) => {
                    const days = Math.max(
                      0,
                      Math.floor(
                        (new Date(exam.examDate).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );
                    return (
                      <div
                        key={exam.id}
                        className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                            {exam.course?.code}
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            {days === 0 ? t("dueToday") : `${days} ${t("daysRemaining")}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {exam.title}
                        </h4>
                        <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                          <div>
                            📅{" "}
                            {new Date(exam.examDate).toLocaleDateString(
                              isRtl ? "ar-SA" : "en-US",
                              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                          {exam.locationRoom && <div>🏛️ {exam.locationRoom}</div>}
                          {exam.seatNumber && <div>💺 {exam.seatNumber}</div>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    لا توجد اختبارات قادمة
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-5">
              <h2 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                {t("quickActions")}
              </h2>

              <div className="mt-4 space-y-2">
                <Link
                  href="/study-planner"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⏱️</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {t("startStudySession")}
                    </span>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                </Link>

                <Link
                  href="/ai-assistant"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {t("askAiBuddy")}
                    </span>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                </Link>

                <Link
                  href="/gpa"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {t("gpaSimulator")}
                    </span>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
