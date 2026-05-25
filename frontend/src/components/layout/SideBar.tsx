'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
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

  const { user, clearAuth } = useAuthStore();
  const socket = useSocketStore((state) => state.socket);

  // Create meeting modal states
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
  const [createMeetingModalVisible, setCreateMeetingModalVisible] = useState(false);
  const [workspaces, setWorkspaces] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const { data: notificationCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 0,
  });

  const { data: notificationListData, refetch: refetchNotifications } = useQuery({
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

    return () => {
      window.removeEventListener('click', onClickOutside);
    };
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

  const openCreateMeetingModal = () => {
    setIsCreateMeetingModalOpen(true);
    setTimeout(() => setCreateMeetingModalVisible(true), 10);
    setError(null);
  };

  const closeCreateMeetingModal = () => {
    setCreateMeetingModalVisible(false);
    setTimeout(() => {
      setIsCreateMeetingModalOpen(false);
      setSelectedWorkspaceId(null);
      setSelectedChannelId(null);
      setMeetingTitle('');
      setMeetingDescription('');
    }, 200);
    setIsCreateMeetingModalOpen(false);
  };

  // Fetch workspaces when user is available
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces/me');
      // Assuming response format: { success: true, data: [ { _id, name, ... } ] }
      setWorkspaces(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
      setWorkspaces([]);
    }
  };

  // Fetch channels when workspace changes
  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchChannels(selectedWorkspaceId);
    } else {
      setChannels([]);
    }
  }, [selectedWorkspaceId]);

  const fetchChannels = async (workspaceId: string) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/channels`);
      setChannels(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch channels for workspace', err);
      setChannels([]);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      setError('Tiêu đề cuộc họp là bắt buộc');
      return;
    }
    if (!selectedWorkspaceId || !selectedChannelId) {
      setError('Vui lòng chọn workspace và kênh');
      return;
    }

    setIsCreatingMeeting(true);
    setError(null);
    try {
      const res = await api.post(
        `/workspaces/${selectedWorkspaceId}/channels/${selectedChannelId}/meetings`,
        { title: meetingTitle.trim(), description: meetingDescription.trim() }
      );
      const meeting = res.data?.data;
      if (meeting && meeting._id) {
        // Close modal and navigate to the meeting lobby
        closeCreateMeetingModal();
        router.push(`/meetings?meetingId=${meeting._id}&workspaceId=${selectedWorkspaceId}&channelId=${selectedChannelId}`);
      } else {
        setError('Không thể tạo cuộc họp');
      }
    } catch (err) {
      console.error('Create meeting failed', err);
      const message =
        typeof (err as { response?: { data?: { message?: string } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          : undefined;
      setError(message || 'Tạo cuộc họp thất bại');
    } finally {
      setIsCreatingMeeting(false);
    }
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

            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex items-center gap-2">
                <p className="font-label-sm text-label-sm text-primary">
                  {currentPlan}
                </p>

                {currentPlan === 'Free Plan' && (
                  <button
                    type="button"
                    onClick={() => router.push('/subscription')}
                    className="cursor-pointer text-[10px] font-bold bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full hover:bg-tertiary/90 transition-colors"
                  >
                    Nâng cấp Pro
                  </button>
                )}
              </div>

              {currentPlan === 'Pro Plan' && user?.subscriptionExpireTime && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Hết hạn: {new Date(user.subscriptionExpireTime).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={openCreateMeetingModal}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-sm px-md rounded-lg mb-lg flex items-center justify-center gap-sm transition-colors shadow-sm cursor-pointer"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Cuộc họp mới
        </button>

        {/* Notifications */}
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
                      className={`group flex gap-3 rounded-xl p-3 transition-colors ${item.isRead
                        ? 'bg-transparent hover:bg-surface-container'
                        : 'bg-primary/5 hover:bg-primary/10'
                        }`}
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
                className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 ease-in-out ${isActive
                  ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed border-l-4 border-primary'
                  : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
                  }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
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
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex cursor-pointer items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-container transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign out
          </button>
        </div>
      </nav>

      {isCreateMeetingModalOpen ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 ${createMeetingModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeCreateMeetingModal}
        >
          <div
            className={`w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl flex flex-col gap-6 transition-all duration-200 ${createMeetingModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">New Meeting</p>
                <h3 className="text-xl font-bold text-on-surface mt-1">Tạo cuộc họp mới</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateMeetingModal}
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-error/20 bg-error-container/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/50">
                Chọn workspace và kênh để bắt đầu cuộc họp ngay lập tức với các thành viên.
              </p>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Workspace</label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-xl border border-outline-variant/30 bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={selectedWorkspaceId || ''}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      setSelectedWorkspaceId(value);
                      setSelectedChannelId(null);
                    }}
                  >
                    <option value="">Chọn workspace</option>
                    {workspaces.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kênh</label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-xl border border-outline-variant/30 bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                    value={selectedChannelId || ''}
                    onChange={(e) => setSelectedChannelId(e.target.value || null)}
                    disabled={!selectedWorkspaceId}
                  >
                    <option value="">Chọn kênh</option>
                    {channels.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tiêu đề</label>
                <input
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Ví dụ: Thảo luận dự án A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Mô tả (tuỳ chọn)</label>
                <textarea
                  className="min-h-[80px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-highest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  placeholder="Mục tiêu cuộc họp..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeCreateMeetingModal}
                className="flex-1 cursor-pointer rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all active:scale-95"
                disabled={isCreatingMeeting}
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={() => void handleCreateMeeting()}
                className="flex-[2] cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                disabled={isCreatingMeeting}
              >
                {isCreatingMeeting ? 'Đang khởi tạo...' : 'Bắt đầu ngay'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
                type="button"
                className="cursor-pointer rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-high"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-primary/90"
                onClick={logout}
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