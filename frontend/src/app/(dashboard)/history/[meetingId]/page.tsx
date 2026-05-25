"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { meetingApi } from '@/services/meetingApi';
import { useAuthStore } from '@/store/authStore';

type ChatItem = {
  userId?: { _id?: string; name?: string; email?: string; avatar?: string } | string;
  content?: string;
  timestamp?: string;
};

const getUserName = (user: ChatItem['userId']) => {
  if (!user) return 'Ẩn danh';
  if (typeof user === 'string') return 'Người dùng';
  return user.name || user.email || 'Ẩn danh';
};

const getUserId = (user: ChatItem['userId']) => {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return String(user._id || '');
};

export default function MeetingChatHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const meetingId = String(params?.meetingId || '');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['meeting-detail', meetingId],
    queryFn: () => meetingApi.getById(meetingId),
    enabled: Boolean(meetingId),
  });

  const meeting = data?.data as {
    title?: string;
    startedAt?: string;
    endedAt?: string;
    durationMinutes?: number;
    chatLog?: ChatItem[];
    summary?: string;
  } | undefined;
  const chatLog: ChatItem[] = Array.isArray(meeting?.chatLog) ? meeting.chatLog : [];

  const durationText = (() => {
    if (typeof meeting?.durationMinutes === 'number' && meeting.durationMinutes >= 0) {
      return `${meeting.durationMinutes} phút`;
    }
    if (meeting?.startedAt && meeting?.endedAt) {
      const minutes = Math.max(
        0,
        differenceInMinutes(new Date(meeting.endedAt), new Date(meeting.startedAt))
      );
      return `${minutes} phút`;
    }
    return '--';
  })();

  return (
    <main className="flex-1 min-h-screen bg-surface-container-low px-lg py-xl">
      <div className="mb-lg flex items-center gap-sm">
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-outline-variant p-2 hover:bg-surface-container-high"
          title="Quay lại lịch sử"
        >
          <MaterialSymbol icon="arrow_back" />
        </button>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Lịch sử chat cuộc họp
        </h1>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg text-on-surface-variant">
          Đang tải lịch sử chat...
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-error bg-surface-container-lowest p-lg text-error">
          Không tải được lịch sử chat của cuộc họp.
        </div>
      )}

      {!isLoading && !isError && meeting && (
        <div className="space-y-md">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{meeting.title || 'Không có tiêu đề'}</h2>
            <div className="mt-sm grid gap-sm text-body-sm text-on-surface-variant md:grid-cols-3">
              <div>
                <span className="font-label-md text-on-surface">Bắt đầu:</span>{' '}
                {meeting.startedAt ? format(new Date(meeting.startedAt), 'HH:mm - dd/MM/yyyy', { locale: vi }) : '--'}
              </div>
              <div>
                <span className="font-label-md text-on-surface">Kết thúc:</span>{' '}
                {meeting.endedAt ? format(new Date(meeting.endedAt), 'HH:mm - dd/MM/yyyy', { locale: vi }) : '--'}
              </div>
              <div>
                <span className="font-label-md text-on-surface">Thời lượng:</span>{' '}
                {durationText}
              </div>
            </div>
          </section>

          {(() => {
            const plan = (currentUser?.plan || currentUser?.subscriptionPlan || 'free').toLowerCase();
            const isPro = plan === 'pro';

            return (
              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Tóm tắt AI</h3>

                {!isPro ? (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
                    Tính năng này chỉ có trên gói <span className="font-semibold text-primary">Pro</span>.
                  </div>
                ) : meeting?.summary ? (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface whitespace-pre-wrap">
                    {meeting.summary}
                  </div>
                ) : (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
                    Chưa có tóm tắt AI cho cuộc họp này.
                  </div>
                )}
              </section>
            );
          })()}

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Nhật ký chat</h3>

            {chatLog.length === 0 ? (
              <div className="text-body-sm text-on-surface-variant">Chưa có tin nhắn nào trong cuộc họp này.</div>
            ) : (
              <div className="space-y-sm">
                {chatLog.map((item, idx) => {
                  const isMine = Boolean(currentUser?.id) && getUserId(item.userId) === String(currentUser?.id);

                  return (
                    <div
                      key={`${item.timestamp || idx}-${idx}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`w-full max-w-[78%] rounded-2xl border px-md py-sm shadow-sm ${
                          isMine
                            ? 'border-primary/20 bg-primary text-on-primary'
                            : 'border-outline-variant bg-surface'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-sm">
                          <span className={`font-label-md ${isMine ? 'text-on-primary' : 'text-on-surface'}`}>
                            {isMine ? 'Bạn' : getUserName(item.userId)}
                          </span>
                          <span className={`text-label-sm ${isMine ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                            {item.timestamp ? format(new Date(item.timestamp), 'HH:mm:ss dd/MM', { locale: vi }) : '--'}
                          </span>
                        </div>
                        <p className={`text-body-sm whitespace-pre-wrap ${isMine ? 'text-on-primary' : 'text-on-surface'}`}>
                          {item.content || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
