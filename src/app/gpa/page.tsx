"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  GraduationCap,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  calculateSemesterGpa,
  calculateCumulativeGpa,
  calculateRequiredSemesterGpa,
  getGradePoints,
  getGradeBadgeClass,
  GRADE_POINTS_5,
  GRADE_POINTS_4,
} from "@/lib/gpa";

export default function GpaPage() {
  const { t, isRtl, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Projected current semester grades
  const [currentGrades, setCurrentGrades] = useState<Record<string, string>>({});
  const [targetGpaInput, setTargetGpaInput] = useState<number>(4.85);

  // Add past record modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPastRecord, setNewPastRecord] = useState({
    customCourseName: "",
    termSemester: "الفصل الأول 1445",
    creditHours: 3,
    letterGrade: "A+",
  });

  const fetchGpaData = async () => {
    try {
      const res = await fetch("/api/gpa");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setTargetGpaInput(json.targetGpa || (json.scale === 4.0 ? 3.8 : 4.85));

        // Initialize current courses projected grades with default A+
        if (json.currentCourses) {
          const initial: Record<string, string> = {};
          json.currentCourses.forEach((c: any) => {
            initial[c.id] = "A+";
          });
          setCurrentGrades(initial);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGpaData();
  }, []);

  const handleGradeChange = (courseId: string, grade: string) => {
    setCurrentGrades((prev) => ({ ...prev, [courseId]: grade }));
  };

  const handleAddPastCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/gpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPastRecord),
      });
      setIsModalOpen(false);
      setNewPastRecord({
        customCourseName: "",
        termSemester: "فصل دراسي سابق",
        creditHours: 3,
        letterGrade: "A+",
      });
      fetchGpaData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePastCourse = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    try {
      await fetch(`/api/gpa?id=${id}`, { method: "DELETE" });
      fetchGpaData();
    } catch (e) {
      console.error(e);
    }
  };

  const scale = data?.scale || 5.0;
  const gradeKeys = scale === 4.0 ? Object.keys(GRADE_POINTS_4) : Object.keys(GRADE_POINTS_5);

  // Dynamic Current Semester Simulation calculation
  const currentCoursesList = data?.currentCourses || [];
  const projectedSemesterCalculation = calculateSemesterGpa(
    currentCoursesList.map((c: any) => ({
      creditHours: c.creditHours,
      letterGrade: currentGrades[c.id] || "A+",
    })),
    scale
  );

  // Projected Cumulative Calculation
  const pastRecordsList = (data?.pastGrades || []).map((g: any) => ({
    creditHours: g.creditHours,
    gradePoints: g.gradePoints,
  }));

  const projectedCurrentRecords = currentCoursesList.map((c: any) => ({
    creditHours: c.creditHours,
    gradePoints: getGradePoints(currentGrades[c.id] || "A+", scale),
  }));

  const projectedCumulativeCalc = calculateCumulativeGpa(
    pastRecordsList,
    projectedCurrentRecords
  );

  // Target Simulation
  const targetSimulation = calculateRequiredSemesterGpa(
    data?.cumulativeGpa || 5.0,
    data?.totalCredits || 0,
    projectedSemesterCalculation.totalCredits,
    targetGpaInput,
    scale
  );

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("gpaTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("gpaSubtitle")}
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            {t("addPastRecord")}
          </Button>
        </div>

        {/* 3 Main GPA Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/15 border-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
                {t("cumulativeGpa")}
              </span>
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black">
                {data?.cumulativeGpa?.toFixed(2) || "5.00"}
              </span>
              <span className="text-sm font-semibold text-indigo-200">/ {scale.toFixed(1)}</span>
            </div>
            <p className="text-xs text-indigo-100 mt-2">
              {t("totalCredits")}: {data?.totalCredits || 0} ساعة دراسية
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                المعدل الفصلي المتوقع (المحاكي)
              </span>
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {projectedSemesterCalculation.gpa.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ {scale.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              بناءً على {projectedSemesterCalculation.totalCredits} ساعة مسجلة هذا الفصل
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                المعدل التراكمي الجديد بعد الفصل
              </span>
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {projectedCumulativeCalc.cumulativeGpa.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ {scale.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              إجمالي الساعات بعد الاجتياز: {projectedCumulativeCalc.totalCredits} ساعة
            </p>
          </Card>
        </div>

        {/* Target GPA Simulator Widget */}
        <Card className="p-6 bg-slate-50/70 dark:bg-slate-900/80 border-2 border-brand-200 dark:border-brand-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t("gpaSimulator")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("targetSimulatorDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {t("targetGpa")}:
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max={scale}
                value={targetGpaInput}
                onChange={(e) => setTargetGpaInput(parseFloat(e.target.value) || scale)}
                className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-brand-600 dark:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-10 rounded-full ${
                  targetSimulation.isPossible
                    ? targetSimulation.status === "challenging"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              <div>
                <span className="text-xs font-medium text-slate-500">
                  {t("neededSemesterGpa")}
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-black ${
                      targetSimulation.isPossible
                        ? targetSimulation.status === "challenging"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {targetSimulation.requiredSemesterGpa.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">/ {scale.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-bold">
              {!targetSimulation.isPossible ? (
                <span className="text-rose-600 dark:text-rose-400">
                  ⚠️ الهدف غير ممكن حسابياً هذا الفصل، يتطلب فصولاً إضافية لتعويض المعدل
                </span>
              ) : targetSimulation.status === "challenging" ? (
                <span className="text-amber-600 dark:text-amber-400">
                  🎯 {t("targetChallenging")}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  💪 {t("targetFeasible")}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Current Semester Courses Simulator */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                محاكاة درجات مقررات هذا الفصل
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                غيّر الدرجات التقديرية المتوقعة لمشاهدة تأثيرها الفوري على المعدل التراكمي
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {currentCoursesList.map((course: any) => (
              <div
                key={course.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-10 rounded-full"
                    style={{ backgroundColor: course.color || "#6366f1" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {isRtl ? course.nameAr : course.nameEn}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {course.creditHours} {t("creditHours")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-500">التقدير المتوقع:</label>
                  <select
                    value={currentGrades[course.id] || "A+"}
                    onChange={(e) => handleGradeChange(course.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {gradeKeys.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade} ({getGradePoints(grade, scale)} نقطة)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Historical Past Semesters Records */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("pastSemesters")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                سجل المواد السابقة المجتازة في الفصول الماضية
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            {data?.terms && data.terms.length > 0 ? (
              data.terms.map((term: any) => (
                <div key={term.termName} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-extrabold text-sm text-brand-700 dark:text-brand-300">
                      {term.termName}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      معدل الفصل: {term.gpa.toFixed(2)} ({term.credits} ساعة)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {term.records.map((grade: any) => (
                      <div
                        key={grade.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {grade.customCourseName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {grade.creditHours} ساعات • {grade.gradePoints} نقطة
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-black border ${getGradeBadgeClass(
                              grade.letterGrade
                            )}`}
                          >
                            {grade.letterGrade}
                          </span>
                          <button
                            onClick={() => handleDeletePastCourse(grade.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">
                لم تتم إضافة فصول سابقة بعد
              </p>
            )}
          </div>
        </Card>

        {/* Modal: Add Past Record */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("addPastRecord")}
        >
          <form onSubmit={handleAddPastCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المقرر ورمزه *
              </label>
              <input
                type="text"
                required
                placeholder="حساب التفاضل والتكامل 1 (MATH 101)"
                value={newPastRecord.customCourseName}
                onChange={(e) =>
                  setNewPastRecord({ ...newPastRecord, customCourseName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الفصل الدراسي *
              </label>
              <input
                type="text"
                required
                placeholder="الفصل الأول 1445"
                value={newPastRecord.termSemester}
                onChange={(e) =>
                  setNewPastRecord({ ...newPastRecord, termSemester: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الساعات المعتمدة *
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={newPastRecord.creditHours}
                  onChange={(e) =>
                    setNewPastRecord({
                      ...newPastRecord,
                      creditHours: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التقدير *
                </label>
                <select
                  value={newPastRecord.letterGrade}
                  onChange={(e) =>
                    setNewPastRecord({ ...newPastRecord, letterGrade: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {gradeKeys.map((g) => (
                    <option key={g} value={g}>
                      {g} ({getGradePoints(g, scale)} نقطة)
                    </option>
                  ))}
                </select>
              </div>
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
