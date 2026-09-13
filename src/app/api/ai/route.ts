import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { processAcademicAiQuery } from "@/lib/ai";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { prompt, category } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "الرجاء إدخال نص السؤال / Prompt required" }, { status: 400 });
    }

    // Save user message
    const userMsg = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "user",
        content: prompt.trim(),
        category: category || "general",
      },
    });

    // Fetch user courses for richer context
    const userCourses = await prisma.course.findMany({
      where: { userId: user.id },
      select: { code: true, nameAr: true, nameEn: true },
    });

    // Process AI query
    const aiResponse = await processAcademicAiQuery(prompt, category, {
      userName: user.name,
      major: user.major,
      courses: userCourses,
      targetGpa: user.targetGpa,
      gpaScale: user.gpaScale,
    });

    // Save AI response
    const aiMsg = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "assistant",
        content: aiResponse.content,
        category: aiResponse.category || "general",
      },
    });

    return NextResponse.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: aiMsg,
      suggestedFollowUps: aiResponse.suggestedFollowUps || [],
    });
  } catch (error: any) {
    console.error("AI assistant error:", error);
    return NextResponse.json({ error: "Failed to process AI response" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.chatMessage.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ success: true, message: "Chat cleared" });
}
