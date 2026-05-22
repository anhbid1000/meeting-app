'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useSocketStore } from '@/store/socketStore';
import notificationApi from '@/services/notificationApi';
import type { NotificationItem } from '@/types/notification';

const getRelativeLabel = (isoDate?: string) => {
  if (!isoDate) return '';
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return '';

  const diffMinutes = Math.floor((Date.now() - time) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function Sidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const socket = useSocketStore((state) => state.socket);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const { data: notificationCountData, refetch: refetchUnreadCount } = useQuery(
    {
      queryKey: ['notifications', 'unread-count'],
      queryFn: () => notificationApi.getUnreadCount(),
      staleTime: 0,
    }
  );

  const { data: notificationListData, refetch: refetchNotifications } =
    useQuery({
      queryKey: ['notifications', 'list'],
      queryFn: () => notificationApi.getNotifications({ page: 1, limit: 8 }),
      staleTime: 0,
      enabled: isNotificationOpen,
    });

  const unreadCount = notificationCountData?.data?.unreadCount ?? 0;
  const notifications: NotificationItem[] = notificationListData?.data ?? [];

  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void refetchUnreadCount();
      if (isNotificationOpen) {
        void refetchNotifications();
      }
    };

    socket.on('notification:new', refresh);
    socket.on('notification:update', refresh);
    socket.on('notification:delete', refresh);

    return () => {
      socket.off('notification:new', refresh);
      socket.off('notification:update', refresh);
      socket.off('notification:delete', refresh);
    };
  }, [
    socket,
    queryClient,
    refetchUnreadCount,
    refetchNotifications,
    isNotificationOpen,
  ]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, []);

  const handleOpenNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      await notificationApi.markAsRead(item._id);
      void refetchUnreadCount();
      void refetchNotifications();
    }

    if (item.type === 'thread_reply' && item.relatedChannelId) {
      const threadParam = item.relatedMessageId
        ? `?thread=${encodeURIComponent(item.relatedMessageId)}`
        : '';
      router.push(`/channels/${item.relatedChannelId}${threadParam}`);
    } else if (item.relatedChannelId) {
      router.push(`/channels/${item.relatedChannelId}`);
    }
    setIsNotificationOpen(false);
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    void refetchUnreadCount();
    void refetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await notificationApi.deleteNotification(id);
    void refetchUnreadCount();
    void refetchNotifications();
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

      <div className="relative mb-md" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsNotificationOpen((prev) => !prev)}
          className="w-full cursor-pointer flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-left transition-colors hover:bg-surface-container-high"
        >
          <span className="flex items-center gap-sm text-on-surface-variant">
            <Bell size={18} />
            Notifications
          </span>
          {unreadCount > 0 ? (
            <span className="min-w-6 rounded-full bg-error px-2 py-0.5 text-center text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>

        {isNotificationOpen ? (
          <div className="absolute left-full top-0 z-50 ml-3 w-96 rounded-2xl border border-outline-variant bg-surface-container-high shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Notifications
                </p>
                <p className="text-xs text-on-surface-variant">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            </div>

            <div className="max-h-[28rem] overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-sm text-on-surface-variant">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`group flex gap-3 rounded-xl p-3 transition-colors ${item.isRead ? 'bg-transparent hover:bg-surface-container' : 'bg-primary/5 hover:bg-primary/10'}`}
                  >
                    <button
                      type="button"
                      onClick={() => void handleOpenNotification(item)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-start cursor-pointer justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">
                            {item.description || 'Open to view details.'}
                          </p>
                        </div>
                        {!item.isRead ? (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        ) : null}
                      </div>
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-on-surface-variant">
                        {getRelativeLabel(item.createdAt)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(item._id)}
                      className="mt-1 rounded-lg cursor-pointer p-1.5 text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:bg-error/10 hover:text-error"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

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
              <span className="flex flex-1 items-center gap-md">
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
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
