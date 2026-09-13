import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unimate_super_secure_jwt_secret_token_key_change_in_production"
);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/courses",
  "/timetable",
  "/assignments",
  "/exams",
  "/gpa",
  "/study-planner",
  "/ai-assistant",
  "/settings",
];

const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("unimate_session")?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

  if (isProtected && !isValid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/") {
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // redirect to login or landing page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/courses/:path*",
    "/timetable/:path*",
    "/assignments/:path*",
    "/exams/:path*",
    "/gpa/:path*",
    "/study-planner/:path*",
    "/ai-assistant/:path*",
    "/settings/:path*",
  ],
};
