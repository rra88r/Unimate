"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Download,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import { generateICalendar, findConflicts } from "@/lib/timetable";

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function TimetablePage() {
  const { t, isRtl, user } = useApp();
  const [slots, setSlots] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'week' or 'day'
  const [activeView, setActiveView] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(0); // 0=Sun

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    dayOfWeek: 0,
    startTime: "08:00",
    endTime: "09:30",
    room: "",
    type: "lecture",
  });

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const fetchTimetableData = async () => {
    try {
      const [slotsRes, coursesRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/courses"),
      ]);
      if (slotsRes.ok && coursesRes.ok) {
        const slotsData = await slotsRes.json();
        const coursesData = await coursesRes.json();
        setSlots(slotsData.slots || []);
        setCourses(coursesData.courses || []);
        if (coursesData.courses?.length > 0) {
          setFormData((prev) => ({ ...prev, courseId: coursesData.courses[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const handleOpenAdd = () => {
    setConflictWarning(null);
    setFormData({
      courseId: courses[0]?.id || "",
      dayOfWeek: selectedDay,
      startTime: "08:00",
      endTime: "09:30",
      room: "",
      type: "lecture",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.hasConflict) {
        setConflictWarning(`تنبيه: يوجد تعارض زمني مع مقرر (${data.conflictWith})!`);
      }
      setIsModalOpen(false);
      fetchTimetableData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    try {
      await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      fetchTimetableData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportICal = () => {
    const icsContent = generateICalendar(
      slots.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        courseId: s.courseId,
        courseCode: s.course?.code,
        courseName: s.course?.nameAr,
        room: s.room || s.course?.locationRoom,
        type: s.type,
      })),
      user?.semester || "Semester"
    );

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "unimate-schedule.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check conflicts across all slots
  const allConflicts = findConflicts(
    slots.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      courseId: s.courseId,
    }))
  );

  const daysLabels = isRtl ? DAYS_AR : DAYS_EN;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("timetableTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("timetableSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportICal}
              icon={<Download className="w-4 h-4" />}
            >
              {t("exportIcs")}
            </Button>
            <Button onClick={handleOpenAdd} size="sm" icon={<Plus className="w-4 h-4" />}>
              {t("addSlot")}
            </Button>
          </div>
        </div>

        {/* Global Conflict Banner (if any) */}
        {allConflicts.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="text-xs sm:text-sm font-semibold">
              {t("conflictDetected")} (يوجد تعارض في مواعيد المحاضرات لنفس اليوم!)
            </div>
          </div>
        )}

        {/* View Toggle Bar (Week vs Day) */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === "week"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("weekView")}
            </button>
            <button
              onClick={() => setActiveView("day")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === "day"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("dayView")}
            </button>
          </div>

          {/* Quick day buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {daysLabels.map((dayName, idx) => (
              <button
                key={dayName}
                onClick={() => {
                  setSelectedDay(idx);
                  if (activeView === "week") setActiveView("day");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDay === idx
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 font-bold"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {dayName}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable Grid / View */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t("loading")}</p>
          </div>
        ) : activeView === "week" ? (
          /* Weekly Grid (Desktop / Tablet & mobile scrollable) */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysLabels.map((dayName, dayIndex) => {
              const daySlots = slots.filter((s) => s.dayOfWeek === dayIndex);
              return (
                <div
                  key={dayName}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {dayName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {daySlots.length} حصص
                    </span>
                  </div>

                  <div className="p-3 flex-1 space-y-2.5 min-h-[220px]">
                    {daySlots.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs py-8">
                        لا توجد محاضرات
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl border relative group transition-all hover:shadow-xs"
                          style={{
                            borderColor: `${slot.course?.color}40` || "#6366f140",
                            backgroundColor: `${slot.course?.color}0d` || "#6366f10d",
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className="font-extrabold text-xs px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: slot.course?.color || "#6366f1" }}
                            >
                              {slot.course?.code}
                            </span>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                            {isRtl ? slot.course?.nameAr : slot.course?.nameEn}
                          </h4>

                          <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {slot.room && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{slot.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Day View (Focused for mobile or detailed inspection) */
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedDay((prev) => (prev > 0 ? prev - 1 : 4))}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                {daysLabels[selectedDay]}
              </h2>
              <button
                onClick={() => setSelectedDay((prev) => (prev < 4 ? prev + 1 : 0))}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-3">
              {slots
                .filter((s) => s.dayOfWeek === selectedDay)
                .map((slot) => (
                  <Card key={slot.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: slot.course?.color || "#6366f1" }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {slot.course?.code}
                          </span>
                          <span className="text-xs text-slate-500">
                            {isRtl ? slot.course?.nameAr : slot.course?.nameEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{slot.room || "قاعة دراسية"}</span>
                          <span>•</span>
                          <span>{slot.type === "lab" ? t("lab") : t("lecture")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Add Slot Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("addSlot")}
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
                {t("day")} *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {daysLabels.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("startTime")} *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("endTime")} *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                  placeholder="قاعة 1A 12"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("slotType")}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="lecture">{t("lecture")}</option>
                  <option value="lab">{t("lab")}</option>
                  <option value="tutorial">{t("tutorial")}</option>
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
