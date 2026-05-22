'use client';

import Link from "next/link";
import { useAuthStore } from '@/store/authStore';

export default function TopNav() {
  const { isAuthenticated, user, logout: authLogout } = useAuthStore();

  const navLinks = [
    { label: "Tính năng", href: "/features" },
    { label: "Giải pháp", href: "/solutions" },
    { label: "Bảng giá", href: "/pricing" },
    { label: "Tài nguyên", href: "/resources" },
  ];

  return (
    <nav className="bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary cursor-pointer active:opacity-80">
          ViMeet
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 font-label-md text-label-md">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href}
              className="text-label-md dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          // Đã đăng nhập
          <>
            <div className="hidden md:flex items-center gap-3">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-on-surface">
                {user?.name}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="bg-primary text-on-primary font-label-md text-label-md px-4 py-1 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Dashboard
            </Link>

            <button
              onClick={authLogout}
              className="font-label-md text-label-md text-secondary hover:text-error transition-colors hidden md:block"
            >
              Logout
            </button>
          </>
        ) : (
          // Chưa đăng nhập
          <>
            <Link href="/login"
              className="font-label-md text-label-md text-secondary hover:text-primary transition-colors hidden md:block"
            >
              Đăng nhập
            </Link>

            <Link href="/register"
              className="bg-primary text-on-primary font-label-md text-label-md px-4 py-1 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Bắt đầu ngay
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
