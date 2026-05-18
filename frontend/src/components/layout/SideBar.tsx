'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: 'home' },
    { label: 'Meetings', href: '/meetings', icon: 'videocam' },
    { label: 'Groups', href: '/groups', icon: 'groups' },
    { label: 'Channels', href: '/channels', icon: 'tag' },
    { label: 'History', href: '/history', icon: 'history' },
    { label: 'Files', href: '/files', icon: 'folder' },
  ];

  const footerItems = [
    { label: 'Profile', href: '/profile', icon: 'person' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col py-lg px-md gap-sm bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant w-sidebar_width h-screen fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="flex items-center gap-md px-sm py-sm mb-md">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold">
          V
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm font-black text-primary dark:text-inverse-primary">
            Workspace
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Premium Plan
          </p>
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
              className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 ease-in-out ${
                isActive
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
              className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 ease-in-out ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
