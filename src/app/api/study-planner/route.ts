import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: { id: true, code: true, nameAr: true, color: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Count sessions today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter((s) => new Date(s.createdAt) >= startOfDay);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return NextResponse.json({
    sessions,
    totalMinutes,
    totalSessionsCount: sessions.length,
    todaySessionsCount: todaySessions.length,
    todayMinutes,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, courseId, durationMinutes, type, notes } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان الجلسة مطلوب / Title required" }, { status: 400 });
    }

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        courseId: courseId || null,
        title: title.trim(),
        durationMinutes: Number(durationMinutes) || 25,
        type: type || "pomodoro",
        isCompleted: true,
        notes: notes ? notes.trim() : null,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Error logging study session:", error);
    return NextResponse.json({ error: "Failed to log session" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.studySession.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Session deleted" });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
