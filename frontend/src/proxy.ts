import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];

export function proxy(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken");
  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
