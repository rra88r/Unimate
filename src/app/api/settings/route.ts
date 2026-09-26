import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university,
      major: user.major,
      semester: user.semester,
      gpaScale: user.gpaScale,
      targetGpa: user.targetGpa,
      language: user.language,
      theme: user.theme,
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, university, major, semester, gpaScale, targetGpa, language, theme } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : user.name,
        university: university !== undefined ? university.trim() : user.university,
        major: major !== undefined ? major.trim() : user.major,
        semester: semester !== undefined ? semester.trim() : user.semester,
        gpaScale: gpaScale !== undefined ? Number(gpaScale) : user.gpaScale,
        targetGpa: targetGpa !== undefined ? Number(targetGpa) : user.targetGpa,
        language: language || user.language,
        theme: theme || user.theme,
      },
      select: {
        id: true,
        name: true,
        email: true,
        university: true,
        major: true,
        semester: true,
        gpaScale: true,
        targetGpa: true,
        language: true,
        theme: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
