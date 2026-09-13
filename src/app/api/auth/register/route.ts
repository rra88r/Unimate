import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, university, major, semester, gpaScale, language } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد وكلمة المرور مطلوبة / Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "يجب ألا تقل كلمة المرور عن 6 خانات / Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل مسبقاً / Email is already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        university: university || "جامعة الملك سعود / King Saud University",
        major: major || "علوم الحاسب / Computer Science",
        semester: semester || "الفصل الحالي",
        gpaScale: gpaScale ? Number(gpaScale) : 5.0,
        targetGpa: gpaScale === 4.0 ? 3.8 : 4.75,
        language: language || "ar",
        theme: "light",
      },
    });

    // Create a starter default course
    await prisma.course.create({
      data: {
        userId: user.id,
        code: "CS 101",
        nameAr: "مقدمة في علوم الحاسب",
        nameEn: "Introduction to Computer Science",
        creditHours: 3,
        instructor: "د. الأستاذ المشرف",
        color: "#6366f1",
        locationRoom: "قاعة 101",
        termSemester: user.semester,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
    });

    setSessionCookie(token);

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
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب / Error creating account" },
      { status: 500 }
    );
  }
}
