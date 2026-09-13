import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.assignment.findMany({
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
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { courseId, title, description, dueDate, priority, status, gradeMax, gradeReceived, weightPercentage } = body;

    if (!courseId || !title || !dueDate) {
      return NextResponse.json(
        { error: "المقرر وعنوان الواجب وتاريخ التسليم مطلوبة / Course, title and due date are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId: user.id,
        courseId,
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: new Date(dueDate),
        priority: priority || "medium",
        status: status || "pending",
        gradeMax: gradeMax ? Number(gradeMax) : null,
        gradeReceived: gradeReceived !== undefined && gradeReceived !== null && gradeReceived !== "" ? Number(gradeReceived) : null,
        weightPercentage: weightPercentage ? Number(weightPercentage) : null,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
