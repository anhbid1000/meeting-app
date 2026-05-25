import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ áp dụng cho các trang login hoặc register
  if (pathname === '/login' || pathname === '/register') {
    const refreshToken = request.cookies.get('refreshToken');

    // Nếu đã có refreshToken, điều hướng sang dashboard
    if (refreshToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Chỉ chạy middleware cho các route mong muốn
export const config = {
  matcher: ['/login', '/register'],
};
