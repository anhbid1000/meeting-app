"use client";

import React, { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { meetingApi } from '@/services/meetingApi';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { format, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import type { MeetingItem } from '@/services/meetingApi';


export default function HistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [summarizingMeetingId, setSummarizingMeetingId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isPro = useMemo(() => {
    const plan = String(user?.subscriptionPlan || user?.plan || 'free').toLowerCase();
    return plan === 'pro';
  }, [user]);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['meetings-history', page, debouncedSearch],
    queryFn: () => meetingApi.getMyHistory({ page, limit: 20, q: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const meetings = (data?.data?.items || []) as MeetingItem[];

  const summarizeMutation = useMutation({
    mutationFn: (meetingId: string) => meetingApi.generateSummary(meetingId),
    onSuccess: () => {
      toast.success('Tóm tắt AI thành công');
    },
    onError: () => {
      toast.error('Tóm tắt AI thất bại');
    },
    onSettled: () => {
      setSummarizingMeetingId(null);
    },
  });
  const pagination = data?.data?.pagination;

  const getHostInitial = (meeting: MeetingItem) => {
    const host = meeting.hostId;
    if (host && typeof host === 'object' && 'name' in host) {
      return String(host.name || '?').charAt(0).toUpperCase();
    }
    return '?';
  };

  const getRefName = (ref: { name?: string } | string | undefined, fallback: string) => {
    if (!ref) return fallback;
    if (typeof ref === 'string') return fallback;
    return String(ref.name || fallback);
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '--';
    const diff = differenceInMinutes(new Date(end), new Date(start));
    if (diff < 60) return `${diff}p`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins > 0 ? `${mins}p` : ''}`;
  };

  return (
    <main className="flex-1 min-h-screen flex flex-col bg-surface-container-low">
      {/* Top Header for Main Content */}
      <header className="px-lg py-xl flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Lịch sử cuộc họp</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Xem lại các cuộc họp trước đây, truy cập bản ghi và xem tóm tắt từ AI.</p>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <MaterialSymbol icon="search" />
          </div>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-all shadow-sm"
            placeholder="Tìm kiếm theo từ khóa, người tham gia..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Meeting List Container (Premium List View) */}
      <div className="px-lg pb-xl flex-1">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="hidden lg:grid grid-cols-12 gap-sm px-lg py-3 bg-surface border-b border-outline-variant font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <div className="col-span-4">Tiêu đề cuộc họp</div>
            <div className="col-span-2">Ngày & Giờ</div>
            <div className="col-span-1">Thời lượng</div>
            <div className="col-span-2">Người tham gia</div>
            <div className="col-span-3 text-right">Thao tác</div>
          </div>

          {/* List Body */}
          <div className="flex flex-col min-h-[400px]">
            {isLoading && (
              <div className="flex-1 flex items-center justify-center p-8 text-on-surface-variant">
                Đang tải dữ liệu...
              </div>
            )}

            {!isLoading && isError && (
              <div className="flex-1 flex items-center justify-center p-8 text-error">
                Có lỗi xảy ra khi tải lịch sử cuộc họp.
              </div>
            )}

            {!isLoading && !isError && meetings.length === 0 && (
              <div className="flex-1 flex items-center justify-center p-8 text-on-surface-variant">
                Không tìm thấy cuộc họp nào.
              </div>
            )}

            {!isLoading && !isError && meetings.map((meeting) => (
              <div key={meeting._id} className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-sm px-lg py-md border-b border-outline-variant last:border-0 hover:bg-surface transition-colors items-center group">
                <div className="col-span-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">{meeting.title}</span>
                    {meeting.hasAiSummary && (
                      <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-secondary-fixed-dim">
                        <MaterialSymbol icon="auto_awesome" filled className="text-[14px]" />
                        Tóm tắt AI
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-medium text-on-primary-container">
                      <MaterialSymbol icon="tag" className="text-[12px]" />
                      #{getRefName(meeting.channelId as { name?: string } | string, 'channel')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-medium text-on-secondary-container">
                      <MaterialSymbol icon="workspaces" className="text-[12px]" />
                      {getRefName(meeting.workspaceId as { name?: string } | string, 'Workspace')}
                    </span>
                  </div>

                  <span className="font-body-sm text-body-sm text-on-surface-variant lg:hidden">
                    {format(new Date(meeting.startedAt), 'dd MMM, yyyy', { locale: vi })} • {formatDuration(meeting.startedAt, meeting.endedAt)}
                  </span>
                </div>
                <div className="col-span-2 hidden lg:flex font-body-sm text-body-sm text-on-surface-variant">
                  {format(new Date(meeting.startedAt), 'dd MMM, yyyy', { locale: vi })}<br />
                  {format(new Date(meeting.startedAt), 'hh:mm a')}
                </div>
                <div className="col-span-1 hidden lg:flex font-body-sm text-body-sm text-on-surface-variant">
                  {formatDuration(meeting.startedAt, meeting.endedAt)}
                </div>
                <div className="col-span-2 flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface-container-lowest flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant cursor-default">
                      {getHostInitial(meeting)}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-start lg:justify-end gap-2">
                  {isPro && (
                    <button
                      onClick={() => {
                        setSummarizingMeetingId(meeting._id);
                        summarizeMutation.mutate(meeting._id);
                      }}
                      disabled={summarizeMutation.isPending && summarizingMeetingId === meeting._id}
                      className="cursor-pointer rounded-lg px-3 py-2 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-60"
                      title="Tóm tắt với AI (Pro)"
                    >
                      {(summarizeMutation.isPending && summarizingMeetingId === meeting._id) ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                          Đang tóm tắt...
                        </>
                      ) : (
                        <>
                          <MaterialSymbol icon="auto_awesome" />
                          Tóm tắt với AI (Pro)
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/history/${meeting._id}`)}
                    className="cursor-pointer bg-surface-variant/50 hover:bg-surface-container-high text-on-surface-variant rounded-lg p-2 transition-colors flex items-center justify-center"
                    title="Nhật ký chat"
                  >
                    <MaterialSymbol icon="chat" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination / Footer */}
          <div className="px-lg py-md border-t border-outline-variant bg-surface flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {pagination && pagination.total > 0
                ? `Hiển thị ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} trong số ${pagination.total} cuộc họp`
                : 'Không có dữ liệu'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg px-3 py-1 font-label-sm text-label-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
                disabled={!pagination || pagination.page <= 1}
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                className="cursor-pointer bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg px-3 py-1 font-label-sm text-label-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
                disabled={!pagination || pagination.page >= pagination.totalPages}
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
