import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasTimeConflict } from "@/lib/timetable";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slots = await prisma.timetableSlot.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          color: true,
          instructor: true,
          locationRoom: true,
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { courseId, dayOfWeek, startTime, endTime, room, type } = body;

    if (!courseId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "المقرر واليوم ووقت البدء والانتهاء مطلوبة / Course, day, start & end time required" },
        { status: 400 }
      );
    }

    // Check existing slots for potential conflicts
    const existingSlots = await prisma.timetableSlot.findMany({
      where: { userId: user.id, dayOfWeek: Number(dayOfWeek) },
      include: { course: true },
    });

    const newSlotItem = {
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    };

    const conflict = existingSlots.find((s) => hasTimeConflict(s, newSlotItem));

    const slot = await prisma.timetableSlot.create({
      data: {
        userId: user.id,
        courseId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        room: room || null,
        type: type || "lecture",
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      slot,
      hasConflict: !!conflict,
      conflictWith: conflict ? conflict.course.code : null,
    });
  } catch (error: any) {
    console.error("Error creating timetable slot:", error);
    return NextResponse.json({ error: "Failed to create timetable slot" }, { status: 500 });
  }
}
