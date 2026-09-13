import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: "demo@unimate.app" },
    });

    if (!demoUser) {
      // Create demo user if not existing
      demoUser = await prisma.user.create({
        data: {
          name: "فيصل العتيبي",
          email: "demo@unimate.app",
          passwordHash: "$2a$10$w8T0Mv84lOsn54ZkI4iMxea6.vOqLwDqjN1nN7hU0cR5tG/57W2wO", // password123
          university: "جامعة الملك سعود / King Saud University",
          major: "هندسة البرمجيات / Software Engineering",
          semester: "الفصل الدراسي الأول 1446هـ",
          gpaScale: 5.0,
          targetGpa: 4.85,
          language: "ar",
          theme: "light",
        },
      });
    }

    const token = await signToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      language: demoUser.language,
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        university: demoUser.university,
        major: demoUser.major,
        semester: demoUser.semester,
        gpaScale: demoUser.gpaScale,
        targetGpa: demoUser.targetGpa,
        language: demoUser.language,
        theme: demoUser.theme,
      },
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Failed demo login" }, { status: 500 });
  }
}
