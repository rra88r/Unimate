import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courseId = params.id;
    const body = await req.json();
    const { code, nameAr, nameEn, creditHours, instructor, color, locationRoom, termSemester, syllabusNotes } = body;

    const existing = await prisma.course.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        code: code !== undefined ? code.trim() : existing.code,
        nameAr: nameAr !== undefined ? nameAr.trim() : existing.nameAr,
        nameEn: nameEn !== undefined ? nameEn.trim() : existing.nameEn,
        creditHours: creditHours !== undefined ? Number(creditHours) : existing.creditHours,
        instructor: instructor !== undefined ? instructor : existing.instructor,
        color: color !== undefined ? color : existing.color,
        locationRoom: locationRoom !== undefined ? locationRoom : existing.locationRoom,
        termSemester: termSemester !== undefined ? termSemester : existing.termSemester,
        syllabusNotes: syllabusNotes !== undefined ? syllabusNotes : existing.syllabusNotes,
      },
    });

    return NextResponse.json({ success: true, course: updated });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courseId = params.id;
    const existing = await prisma.course.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
