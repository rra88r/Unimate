import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exam = await prisma.exam.findFirst({
    where: { id: params.id, userId: user.id },
    include: { course: true },
  });

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, exam });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const examId = params.id;
    const body = await req.json();
    const { courseId, title, examDate, durationMinutes, locationRoom, seatNumber, weightPercentage, status, notes } = body;

    const existing = await prisma.exam.findFirst({
      where: { id: examId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: {
        courseId: courseId || existing.courseId,
        title: title !== undefined ? title.trim() : existing.title,
        examDate: examDate ? new Date(examDate) : existing.examDate,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : existing.durationMinutes,
        locationRoom: locationRoom !== undefined ? locationRoom : existing.locationRoom,
        seatNumber: seatNumber !== undefined ? seatNumber : existing.seatNumber,
        weightPercentage: weightPercentage !== undefined ? (weightPercentage ? Number(weightPercentage) : null) : existing.weightPercentage,
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: { course: true },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error: any) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const examId = params.id;
    const existing = await prisma.exam.findFirst({
      where: { id: examId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    return NextResponse.json({ success: true, message: "Exam deleted" });
  } catch (error: any) {
    console.error("Error deleting exam:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
