import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    include: {
      timetableSlots: true,
      assignments: {
        orderBy: { dueDate: "asc" },
      },
      exams: {
        orderBy: { examDate: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { code, nameAr, nameEn, creditHours, instructor, color, locationRoom, termSemester, syllabusNotes } = body;

    if (!code || !nameAr) {
      return NextResponse.json(
        { error: "رمز المقرر واسم المقرر بالعربية مطلوبان / Code and Arabic name are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        userId: user.id,
        code: code.trim(),
        nameAr: nameAr.trim(),
        nameEn: (nameEn || nameAr).trim(),
        creditHours: Number(creditHours) || 3,
        instructor: instructor ? instructor.trim() : null,
        color: color || "#6366f1",
        locationRoom: locationRoom ? locationRoom.trim() : null,
        termSemester: termSemester || user.semester,
        syllabusNotes: syllabusNotes ? syllabusNotes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
