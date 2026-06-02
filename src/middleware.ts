import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "mathpower-session";

const publicRoutes = ["/login", "/api/auth"];

const parentRoutes = ["/parent"];
const childRoutes = ["/child"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (pathname === "/" || pathname === "") {
    if (sessionCookie) {
      const [role] = sessionCookie.value.split(":");
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    if (sessionCookie && pathname === "/login") {
      const [role] = sessionCookie.value.split(":");
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const parts = sessionCookie.value.split(":");
  const role = parts[0];

  if (parentRoutes.some((r) => pathname.startsWith(r)) && role !== "parent") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  if (childRoutes.some((r) => pathname.startsWith(r)) && role !== "child") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};