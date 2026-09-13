import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exams = await prisma.exam.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          color: true,
        },
      },
    },
    orderBy: { examDate: "asc" },
  });

  return NextResponse.json({ exams });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { courseId, title, examDate, durationMinutes, locationRoom, seatNumber, weightPercentage, status, notes } = body;

    if (!courseId || !title || !examDate) {
      return NextResponse.json(
        { error: "المقرر وعنوان الاختبار وتاريخه مطلوبة / Course, title and exam date are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        courseId,
        title: title.trim(),
        examDate: new Date(examDate),
        durationMinutes: durationMinutes ? Number(durationMinutes) : 90,
        locationRoom: locationRoom ? locationRoom.trim() : null,
        seatNumber: seatNumber ? seatNumber.trim() : null,
        weightPercentage: weightPercentage ? Number(weightPercentage) : null,
        status: status || "upcoming",
        notes: notes ? notes.trim() : null,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
