"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { goToAuthOrDashboard } from "@/utils/authRedirect";

export default function TopNav() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navLinks = [
    { label: "Tính năng", href: "/features" },
    { label: "Giải pháp", href: "/solutions" },
    { label: "Bảng giá", href: "/pricing" },
    { label: "Tài nguyên", href: "/resources" },
  ];

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Signed out successfully");
    } catch {
      toast.error("Unable to contact the server. You have been signed out locally.");
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

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
              Bang dieu khien
            </Link>

            <button
              onClick={logout}
              className="font-label-md text-label-md text-secondary hover:text-error transition-colors hidden md:block"
            >
              Dang xuat
            </button>
          </>
        ) : (
          // Chưa đăng nhập
          <>
        <button
          className="font-label-md text-label-md text-secondary hover:text-primary transition-colors hidden md:block"
          onClick={() => goToAuthOrDashboard(router, "/login")}
          type="button"
        >
          Đăng nhập
        </button>

        <button
          className="bg-primary text-on-primary font-label-md text-label-md px-4 py-1 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          onClick={() => goToAuthOrDashboard(router, "/register")}
          type="button"
        >
          Bắt đầu ngay
        </button>
        </> )}
      </div>
      
    </nav>
  );
}
