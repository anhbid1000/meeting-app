'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    { label: 'Trang chủ', href: '/dashboard', icon: 'home' },
    { label: 'Cuộc họp', href: '/meetings', icon: 'videocam' },
    { label: 'Nhóm', href: '/groups', icon: 'groups' },
    { label: 'Kênh', href: '/channels', icon: 'tag' },
    { label: 'Lịch sử', href: '/history', icon: 'history' },
    { label: 'Tệp', href: '/files', icon: 'folder' },
  ];

  const footerItems = [
    { label: 'Hồ sơ', href: '/profile', icon: 'person' },
    { label: 'Cài đặt', href: '/settings', icon: 'settings' },
  ];

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Unable to contact the server. You have been signed out locally.');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const currentPlan = useMemo(() => {
    const plan = user?.plan || user?.subscriptionPlan || 'free';
    return String(plan).toLowerCase() === 'pro' ? 'Pro Plan' : 'Free Plan';
  }, [user]);

  return (
    <>
      <nav className="hidden md:flex flex-col py-lg px-md gap-sm bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant w-sidebar_width h-screen fixed left-0 top-0 z-40">
        {/* Header */}
        <div className="flex items-center gap-md px-sm py-sm mb-md">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'V'}
            </div>
          )}
          <div>
            <h2 className="font-headline-sm text-headline-sm font-black text-primary dark:text-inverse-primary">
              {user?.name || 'Workspace'}
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {user?.email || 'example@vimeet.com'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-label-sm text-label-sm text-primary">
                {currentPlan}
              </p>
              {currentPlan === 'Free Plan' && (
                <button
                  type="button"
                  className="text-[10px] font-bold bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full hover:bg-tertiary/90 transition-colors"
                >
                  Nâng cấp Pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-sm px-md rounded-lg mb-lg flex items-center justify-center gap-sm transition-colors shadow-sm">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          New Collaboration
        </button>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-xs">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 ease-in-out ${isActive
                    ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed border-l-4 border-primary'
                    : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
                  }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-auto border-t border-outline-variant pt-sm flex flex-col gap-xs">
          {footerItems.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 ease-in-out ${isActive
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex cursor-pointer items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container transition-all duration-200 ease-in-out"
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign out
          </button>
        </div>
      </nav>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-[380px] rounded-xl border border-outline-variant bg-surface p-6 shadow-xl">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Sign out?
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              You will need to sign in again to access your workspace.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="cursor-pointer rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-high"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-primary/90"
                onClick={logout}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
