import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignment = await prisma.assignment.findFirst({
    where: { id: params.id, userId: user.id },
    include: { course: true },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, assignment });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const assignmentId = params.id;
    const body = await req.json();
    const { courseId, title, description, dueDate, priority, status, gradeMax, gradeReceived, weightPercentage } = body;

    const existing = await prisma.assignment.findFirst({
      where: { id: assignmentId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        courseId: courseId || existing.courseId,
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description : existing.description,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        priority: priority || existing.priority,
        status: status || existing.status,
        gradeMax: gradeMax !== undefined ? (gradeMax ? Number(gradeMax) : null) : existing.gradeMax,
        gradeReceived: gradeReceived !== undefined ? (gradeReceived !== null && gradeReceived !== "" ? Number(gradeReceived) : null) : existing.gradeReceived,
        weightPercentage: weightPercentage !== undefined ? (weightPercentage ? Number(weightPercentage) : null) : existing.weightPercentage,
      },
      include: { course: true },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const assignmentId = params.id;
    const { status } = await req.json();

    const existing = await prisma.assignment.findFirst({
      where: { id: assignmentId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status },
      include: { course: true },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error: any) {
    console.error("Error patching assignment:", error);
    return NextResponse.json({ error: "Failed to patch assignment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const assignmentId = params.id;
    const existing = await prisma.assignment.findFirst({
      where: { id: assignmentId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true, message: "Assignment deleted" });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
