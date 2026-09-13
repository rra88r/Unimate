import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const slotId = params.id;
    const body = await req.json();
    const { courseId, dayOfWeek, startTime, endTime, room, type } = body;

    const existing = await prisma.timetableSlot.findFirst({
      where: { id: slotId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const updated = await prisma.timetableSlot.update({
      where: { id: slotId },
      data: {
        courseId: courseId || existing.courseId,
        dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : existing.dayOfWeek,
        startTime: startTime || existing.startTime,
        endTime: endTime || existing.endTime,
        room: room !== undefined ? room : existing.room,
        type: type || existing.type,
      },
      include: { course: true },
    });

    return NextResponse.json({ success: true, slot: updated });
  } catch (error: any) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const slotId = params.id;
    const existing = await prisma.timetableSlot.findFirst({
      where: { id: slotId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await prisma.timetableSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ success: true, message: "Slot deleted" });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
