import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateCumulativeGpa } from "@/lib/gpa";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...

  // 1. Fetch enrolled courses
  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      code: true,
      nameAr: true,
      nameEn: true,
      creditHours: true,
      color: true,
      locationRoom: true,
      instructor: true,
    },
  });

  // 2. Fetch today's classes
  const todayClasses = await prisma.timetableSlot.findMany({
    where: {
      userId: user.id,
      dayOfWeek: currentDayOfWeek,
    },
    include: {
      course: true,
    },
    orderBy: { startTime: "asc" },
  });

  // 3. Fetch urgent pending assignments (next 14 days or pending)
  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      userId: user.id,
      status: { not: "completed" },
    },
    include: {
      course: true,
    },
    orderBy: { dueDate: "asc" },
    take: 6,
  });

  // 4. Fetch upcoming exams
  const upcomingExams = await prisma.exam.findMany({
    where: {
      userId: user.id,
      status: "upcoming",
      examDate: { gte: now },
    },
    include: {
      course: true,
    },
    orderBy: { examDate: "asc" },
    take: 4,
  });

  // 5. Calculate cumulative GPA from past grades
  const pastGrades = await prisma.gradeRecord.findMany({
    where: { userId: user.id },
    select: { creditHours: true, gradePoints: true },
  });

  const gpaSummary = calculateCumulativeGpa(pastGrades);

  // 6. Recent study stats
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaySessions = await prisma.studySession.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: startOfDay },
    },
    select: { durationMinutes: true },
  });

  const todayStudyMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return NextResponse.json({
    user,
    coursesCount: courses.length,
    courses,
    todayClasses,
    pendingAssignments,
    upcomingExams,
    gpaSummary: {
      cumulativeGpa: gpaSummary.cumulativeGpa,
      totalCredits: gpaSummary.totalCredits,
      scale: user.gpaScale || 5.0,
      targetGpa: user.targetGpa || 4.75,
    },
    studyStats: {
      todaySessionsCount: todaySessions.length,
      todayStudyMinutes,
    },
  });
}
