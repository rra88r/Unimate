"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Flame,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

export default function ExamsPage() {
  const { t, isRtl } = useApp();
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    examDate: "",
    durationMinutes: 90,
    locationRoom: "",
    seatNumber: "",
    weightPercentage: 25,
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [exRes, coRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/courses"),
      ]);
      if (exRes.ok && coRes.ok) {
        const exData = await exRes.json();
        const coData = await coRes.json();
        setExams(exData.exams || []);
        setCourses(coData.courses || []);
        if (coData.courses?.length > 0 && !formData.courseId) {
          setFormData((prev) => ({ ...prev, courseId: coData.courses[0].id }));
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    setFormData({
      courseId: courses[0]?.id || "",
      title: "",
      examDate: inTwoWeeks.toISOString().slice(0, 16),
      durationMinutes: 90,
      locationRoom: "",
      seatNumber: "",
      weightPercentage: 25,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      courseId: item.courseId,
      title: item.title,
      examDate: new Date(item.examDate).toISOString().slice(0, 16),
      durationMinutes: item.durationMinutes || 90,
      locationRoom: item.locationRoom || "",
      seatNumber: item.seatNumber || "",
      weightPercentage: item.weightPercentage || 25,
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetch(`/api/exams/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    try {
      await fetch(`/api/exams/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const nearestExam = exams[0];
  let daysToNearest = 0;
  let hoursToNearest = 0;
  if (nearestExam) {
    const diff = new Date(nearestExam.examDate).getTime() - Date.now();
    if (diff > 0) {
      daysToNearest = Math.floor(diff / (1000 * 60 * 60 * 24));
      hoursToNearest = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("examsTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("examsSubtitle")}
            </p>
          </div>

          <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            {t("addExam")}
          </Button>
        </div>

        {/* Highlight Card: Next Exam Countdown */}
        {nearestExam && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-6 sm:p-8 border border-slate-700 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-3 border border-rose-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  <span>أقرب اختبار فصلي قادم</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  {nearestExam.course?.code} - {nearestExam.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                  <span>
                    📅{" "}
                    {new Date(nearestExam.examDate).toLocaleDateString(
                      isRtl ? "ar-SA" : "en-US",
                      { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                  {nearestExam.locationRoom && <span>🏛️ {nearestExam.locationRoom}</span>}
                  {nearestExam.seatNumber && <span>💺 {nearestExam.seatNumber}</span>}
                </div>
              </div>

              {/* Countdown Numbers */}
              <div className="flex items-center gap-3">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[70px]">
                  <span className="block text-2xl sm:text-3xl font-black text-rose-400">
                    {daysToNearest}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {t("daysCount")}
                  </span>
                </div>
                <span className="text-2xl font-bold text-slate-500">:</span>
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[70px]">
                  <span className="block text-2xl sm:text-3xl font-black text-amber-400">
                    {hoursToNearest}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {t("hoursCount")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exams List Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t("loading")}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد اختبارات مجدولة حالياً. أضف مواعيد اختباراتك الأولى!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const diff = new Date(exam.examDate).getTime() - Date.now();
              const daysLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

              return (
                <Card key={exam.id} className="p-5 flex flex-col justify-between hover:shadow-md">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-extrabold text-xs px-2.5 py-1 rounded-md text-white"
                        style={{ backgroundColor: exam.course?.color || "#6366f1" }}
                      >
                        {exam.course?.code}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-3 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isRtl ? exam.course?.nameAr : exam.course?.nameEn}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(exam.examDate).toLocaleDateString(
                            isRtl ? "ar-SA" : "en-US",
                            { month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {exam.durationMinutes} دقيقة • {exam.weightPercentage}% من المقرر
                        </span>
                      </div>

                      {exam.locationRoom && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.locationRoom}</span>
                        </div>
                      )}

                      {exam.seatNumber && (
                        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                          <span>💺 {exam.seatNumber}</span>
                        </div>
                      )}

                      {exam.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                          {exam.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      {daysLeft === 0 ? "يستحق اليوم!" : `${daysLeft} ${t("daysRemaining")}`}
                    </span>
                    <Badge variant="slate">{exam.status === "upcoming" ? "قادم" : "تم"}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? t("editExam") : t("addExam")}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("coursesTitle")} *
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {isRtl ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("examTitle")} *
              </label>
              <input
                type="text"
                required
                placeholder="الاختبار النصفي الأول"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("examDate")} *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("duration")}
                </label>
                <input
                  type="number"
                  placeholder="90"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 90 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("hallOrRoom")}
                </label>
                <input
                  type="text"
                  placeholder="قاعة 101"
                  value={formData.locationRoom}
                  onChange={(e) => setFormData({ ...formData, locationRoom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("seatNumber")}
                </label>
                <input
                  type="text"
                  placeholder="مقعد B-12"
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("weight")}
              </label>
              <input
                type="number"
                placeholder="25%"
                value={formData.weightPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, weightPercentage: parseInt(e.target.value) || 25 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("notes")}
              </label>
              <textarea
                rows={2}
                placeholder="مواضيع الاختبار والفصول المطلوبة..."
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
