"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { Card, Badge, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import confetti from "canvas-confetti";
import { triggerHapticNotification } from "@/lib/capacitor";

export default function AssignmentsPage() {
  const { t, isRtl } = useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    status: "pending",
    gradeMax: "",
    gradeReceived: "",
    weightPercentage: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [assignRes, coursesRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/courses"),
      ]);
      if (assignRes.ok && coursesRes.ok) {
        const aData = await assignRes.json();
        const cData = await coursesRes.json();
        setAssignments(aData.assignments || []);
        setCourses(cData.courses || []);
        if (cData.courses?.length > 0) {
          setFormData((prev) => (prev.courseId ? prev : { ...prev, courseId: cData.courses[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      courseId: courses[0]?.id || "",
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      status: "pending",
      gradeMax: "15",
      gradeReceived: "",
      weightPercentage: "15",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      courseId: item.courseId,
      title: item.title,
      description: item.description || "",
      dueDate: new Date(item.dueDate).toISOString().split("T")[0],
      priority: item.priority || "medium",
      status: item.status || "pending",
      gradeMax: item.gradeMax !== null ? String(item.gradeMax) : "",
      gradeReceived: item.gradeReceived !== null ? String(item.gradeReceived) : "",
      weightPercentage: item.weightPercentage !== null ? String(item.weightPercentage) : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetch(`/api/assignments/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/assignments", {
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

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === "completed" ? "pending" : "completed";
    if (nextStatus === "completed") {
      triggerHapticNotification();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
      } catch {}
    }
    try {
      await fetch(`/api/assignments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete") + "?")) return;
    try {
      await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = assignments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.course?.code && a.course.code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("assignmentsTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("assignmentsSubtitle")}
            </p>
          </div>

          <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            {t("addAssignment")}
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "all"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("all")}
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("pending")}
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "in_progress"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("inProgress")}
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "completed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t("completed")}
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t("loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد واجبات مطابقة للتصفية
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const isCompleted = item.status === "completed";
              const isOverdue =
                !isCompleted &&
                new Date(item.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

              return (
                <Card
                  key={item.id}
                  className={`p-4 transition-all ${
                    isCompleted
                      ? "bg-slate-50 dark:bg-slate-900/40 opacity-70"
                      : "hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="font-bold text-xs px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: item.course?.color || "#6366f1" }}
                          >
                            {item.course?.code}
                          </span>
                          <h3
                            className={`font-bold text-sm ${
                              isCompleted
                                ? "line-through text-slate-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(item.dueDate).toLocaleDateString(
                                isRtl ? "ar-SA" : "en-US",
                                { month: "short", day: "numeric", weekday: "short" }
                              )}
                            </span>
                          </div>

                          {item.weightPercentage && (
                            <span>{item.weightPercentage}% من المقرر</span>
                          )}

                          {item.gradeReceived !== null && (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {item.gradeReceived} / {item.gradeMax} درجات
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isOverdue && <Badge variant="rose">{t("overdue")}</Badge>}
                      {item.priority === "high" && <Badge variant="amber">{t("high")}</Badge>}

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
          title={editingItem ? t("editAssignment") : t("addAssignment")}
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
                {t("assignmentTitle")} *
              </label>
              <input
                type="text"
                required
                placeholder="مشروع متطلبات النظام SRS"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوصف والملاحظات
              </label>
              <textarea
                rows={2}
                placeholder="تفاصيل التسليم والشروط المحددة من الدكتور..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("dueDate")} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("priority")}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="low">{t("low")}</option>
                  <option value="medium">{t("medium")}</option>
                  <option value="high">{t("high")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("maxGrade")}
                </label>
                <input
                  type="number"
                  placeholder="15"
                  value={formData.gradeMax}
                  onChange={(e) => setFormData({ ...formData, gradeMax: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("earnedGrade")}
                </label>
                <input
                  type="number"
                  placeholder="14"
                  value={formData.gradeReceived}
                  onChange={(e) => setFormData({ ...formData, gradeReceived: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("weight")}
                </label>
                <input
                  type="number"
                  placeholder="15%"
                  value={formData.weightPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, weightPercentage: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
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
