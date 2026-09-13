"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Clock,
  FileText,
  Search,
} from "lucide-react";

const COURSE_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#ef4444", // red
];

export default function CoursesPage() {
  const { t, isRtl, user } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    creditHours: 3,
    instructor: "",
    locationRoom: "",
    color: "#6366f1",
    syllabusNotes: "",
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      creditHours: 3,
      instructor: "",
      locationRoom: "",
      color: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
      syllabusNotes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      nameAr: course.nameAr,
      nameEn: course.nameEn,
      creditHours: course.creditHours,
      instructor: course.instructor || "",
      locationRoom: course.locationRoom || "",
      color: course.color || "#6366f1",
      syllabusNotes: course.syllabusNotes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await fetch(`/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteCourseConfirm"))) return;
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" });
      fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.nameAr.toLowerCase().includes(q) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
      (c.instructor && c.instructor.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("coursesTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("coursesSubtitle")}
            </p>
          </div>

          <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            {t("addCourse")}
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t("loading")}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("noCoursesFound")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Color Accent Bar */}
                  <div className="h-2.5 w-full" style={{ backgroundColor: course.color }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="font-black text-xs px-2.5 py-1 rounded-md text-white shadow-xs"
                          style={{ backgroundColor: course.color }}
                        >
                          {course.code}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2.5 leading-snug">
                          {isRtl ? course.nameAr : course.nameEn || course.nameAr}
                        </h3>
                        {course.nameEn && isRtl && (
                          <p className="text-xs text-slate-400 mt-0.5">{course.nameEn}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title={t("edit")}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title={t("delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Items */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      {course.instructor && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.instructor}</span>
                        </div>
                      )}
                      {course.locationRoom && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.locationRoom}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {course.creditHours} {t("creditHours")}
                        </span>
                      </div>
                      {course.syllabusNotes && (
                        <div className="flex items-start gap-2 pt-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 text-slate-500 italic">
                            {course.syllabusNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Card Footer */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {course.assignments?.length || 0} {t("navAssignments")}
                  </span>
                  <span className="text-slate-500">
                    {course.exams?.length || 0} {t("navExams")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Course Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCourse ? t("editCourse") : t("addCourse")}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("courseCode")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="CSC 212"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("creditHours")} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={formData.creditHours}
                  onChange={(e) =>
                    setFormData({ ...formData, creditHours: parseInt(e.target.value) || 3 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("courseNameAr")} *
              </label>
              <input
                type="text"
                required
                placeholder="هياكل البيانات والخوارزميات"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("courseNameEn")}
              </label>
              <input
                type="text"
                placeholder="Data Structures & Algorithms"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("instructorName")}
                </label>
                <input
                  type="text"
                  placeholder="د. سامي الشريف"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("hallOrRoom")}
                </label>
                <input
                  type="text"
                  placeholder="مبنى 31 - قاعة 1A"
                  value={formData.locationRoom}
                  onChange={(e) => setFormData({ ...formData, locationRoom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                لون المقرر
              </label>
              <div className="flex items-center gap-2">
                {COURSE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      formData.color === c ? "scale-125 border-white shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("syllabus")}
              </label>
              <textarea
                rows={2}
                placeholder="ملاحظات وتفاصيل خطة المنهج والمصادر..."
                value={formData.syllabusNotes}
                onChange={(e) => setFormData({ ...formData, syllabusNotes: e.target.value })}
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
