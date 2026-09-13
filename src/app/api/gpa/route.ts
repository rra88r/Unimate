import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateSemesterGpa,
  calculateCumulativeGpa,
  calculateRequiredSemesterGpa,
  getGradePoints,
} from "@/lib/gpa";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pastGrades = await prisma.gradeRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const currentCourses = await prisma.course.findMany({
    where: { userId: user.id },
    include: {
      assignments: true,
      exams: true,
    },
  });

  const scale = user.gpaScale || 5.0;

  // Calculate past cumulative GPA
  const pastCalc = calculateCumulativeGpa(
    pastGrades.map((g) => ({
      creditHours: g.creditHours,
      gradePoints: g.gradePoints,
    }))
  );

  // Group past grades by term
  const termsMap: Record<string, typeof pastGrades> = {};
  for (const grade of pastGrades) {
    const term = grade.termSemester || "Past Semester";
    if (!termsMap[term]) termsMap[term] = [];
    termsMap[term].push(grade);
  }

  const terms = Object.entries(termsMap).map(([termName, records]) => {
    const semCalc = calculateSemesterGpa(records, scale);
    return {
      termName,
      records,
      gpa: semCalc.gpa,
      credits: semCalc.totalCredits,
    };
  });

  const currentSemesterCredits = currentCourses.reduce((sum, c) => sum + c.creditHours, 0);

  // Target GPA simulator
  const simulation = calculateRequiredSemesterGpa(
    pastCalc.cumulativeGpa,
    pastCalc.totalCredits,
    currentSemesterCredits,
    user.targetGpa || 4.75,
    scale
  );

  return NextResponse.json({
    scale,
    targetGpa: user.targetGpa,
    cumulativeGpa: pastCalc.cumulativeGpa,
    totalCredits: pastCalc.totalCredits,
    currentSemesterCredits,
    terms,
    pastGrades,
    currentCourses,
    simulation,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { customCourseName, termSemester, creditHours, letterGrade, gradePoints } = body;

    if (!customCourseName || !creditHours || !letterGrade) {
      return NextResponse.json(
        { error: "اسم المقرر وعدد الساعات والتقدير مطلوبة / Course name, credits, and grade are required" },
        { status: 400 }
      );
    }

    const calculatedPoints =
      gradePoints !== undefined
        ? Number(gradePoints)
        : getGradePoints(letterGrade, user.gpaScale || 5.0);

    const record = await prisma.gradeRecord.create({
      data: {
        userId: user.id,
        customCourseName: customCourseName.trim(),
        termSemester: termSemester ? termSemester.trim() : "فصل دراسي سابق",
        creditHours: Number(creditHours) || 3,
        letterGrade: letterGrade.trim().toUpperCase(),
        gradePoints: calculatedPoints,
        isCompleted: true,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("Error creating grade record:", error);
    return NextResponse.json({ error: "Failed to create grade record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Grade ID required" }, { status: 400 });
    }

    const existing = await prisma.gradeRecord.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.gradeRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Record deleted" });
  } catch (error: any) {
    console.error("Error deleting grade record:", error);
    return NextResponse.json({ error: "Failed to delete grade record" }, { status: 500 });
  }
}
