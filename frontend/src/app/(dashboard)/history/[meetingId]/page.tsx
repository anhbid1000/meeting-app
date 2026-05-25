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
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{meeting.title || 'Không có tiêu đề'}</h2>
            
            {/* Thêm Channel / Workspace ở đây */}
            <div className="flex items-center gap-2 mb-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-medium text-on-primary-container">
                <MaterialSymbol icon="tag" className="!text-[14px]" />
                {(meeting as any)?.channelId?.name || 'General'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-medium text-on-secondary-container">
                <MaterialSymbol icon="workspaces" className="!text-[14px]" />
                {(meeting as any)?.workspaceId?.name || 'Workspace'}
              </span>
            </div>

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

            // Logic render nội dung AI chi tiết
            let aiData: {
              title?: string;
              summary?: string;
              key_points?: string[];
              decisions?: string[];
              action_items?: Array<{ task: string; owner: string | null; due: string | null }>;
              risks_and_questions?: string[];
              next_meeting?: { proposed_time: string | null; agenda: string[] };
            } | null = null;
            let isPlainText = false;

            try {
              if (meeting?.summary) {
                if (typeof meeting.summary === 'string' && meeting.summary.trim().startsWith('{')) {
                  aiData = JSON.parse(meeting.summary);
                } else if (typeof meeting.summary === 'object') {
                  aiData = meeting.summary;
                } else {
                  isPlainText = true;
                }
              }
            } catch (e) {
              console.error("Lỗi parse AI summary:", e);
              isPlainText = true;
            }

            return (
              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Tóm tắt cuộc họp AI</h3>

                {!isPro ? (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
                    Tính năng này chỉ có trên gói <span className="font-semibold text-primary">Pro</span>.
                  </div>
                ) : !meeting?.summary ? (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface-variant">
                    Chưa có tóm tắt AI cho cuộc họp này.
                  </div>
                ) : isPlainText ? (
                  <div className="rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-sm text-on-surface whitespace-pre-wrap">
                    {meeting.summary}
                  </div>
                ) : aiData ? (
                  <div className="space-y-lg rounded-lg border border-outline-variant bg-surface p-md">
                    {/* Main Summary */}
                    {aiData.summary && (
                      <p className="text-body-md text-on-surface leading-relaxed">{aiData.summary}</p>
                    )}

                    <div className="grid gap-lg md:grid-cols-2">
                      <div className="space-y-lg">
                        {/* Key Points */}
                        {Array.isArray(aiData.key_points) && aiData.key_points.length > 0 && (
                          <div>
                            <h4 className="font-label-lg font-bold text-primary mb-xs flex items-center gap-2">
                              <MaterialSymbol icon="hotel_class" className="!text-[18px]" /> Điểm chính
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-body-sm text-on-surface-variant">
                              {aiData.key_points.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Decisions */}
                        {Array.isArray(aiData.decisions) && aiData.decisions.length > 0 && (
                          <div>
                            <h4 className="font-label-lg font-bold text-success mb-xs flex items-center gap-2">
                              <MaterialSymbol icon="check_circle" className="!text-[18px]" /> Quyết định
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-body-sm text-on-surface-variant">
                              {aiData.decisions.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-lg">
                        {/* Action Items */}
                        {Array.isArray(aiData.action_items) && aiData.action_items.length > 0 && (
                          <div>
                            <h4 className="font-label-lg font-bold text-secondary mb-xs flex items-center gap-2">
                              <MaterialSymbol icon="task" className="!text-[18px]" /> Nhiệm vụ cần làm
                            </h4>
                            <div className="space-y-2">
                              {aiData.action_items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm">
                                  <p className="text-body-sm text-on-surface font-medium">{item.task}</p>
                                  <div className="flex flex-wrap gap-3 text-[11px] text-on-surface-variant">
                                    <span className="flex items-center gap-1">
                                      <MaterialSymbol icon="person" className="!text-[14px]" /> {item.owner || 'Chưa phân công'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MaterialSymbol icon="calendar_today" className="!text-[14px]" /> {item.due || 'Không thời hạn'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risks & Questions */}
                        {Array.isArray(aiData.risks_and_questions) && aiData.risks_and_questions.length > 0 && (
                          <div>
                            <h4 className="font-label-lg font-bold text-error mb-xs flex items-center gap-2">
                              <MaterialSymbol icon="warning" className="!text-[18px]" /> Rủi ro & Câu hỏi
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-body-sm text-on-surface-variant">
                              {aiData.risks_and_questions.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next Meeting */}
                    {aiData.next_meeting && (aiData.next_meeting.proposed_time || (Array.isArray(aiData.next_meeting.agenda) && aiData.next_meeting.agenda.length > 0)) && (
                      <div className="border-t border-outline-variant pt-md mt-md">
                        <h4 className="font-label-lg font-bold text-tertiary mb-sm flex items-center gap-2">
                          <MaterialSymbol icon="event_upcoming" className="!text-[18px]" /> Cuộc họp tiếp theo
                        </h4>
                        <div className="space-y-2 text-body-sm text-on-surface-variant">
                          {aiData.next_meeting.proposed_time && (
                            <p><span className="font-semibold text-on-surface">Thời gian dự kiến:</span> {aiData.next_meeting.proposed_time}</p>
                          )}
                          {Array.isArray(aiData.next_meeting.agenda) && aiData.next_meeting.agenda.length > 0 && (
                            <div>
                              <span className="font-semibold text-on-surface block mb-1">Agenda dự kiến:</span>
                              <ul className="list-disc list-inside space-y-1 pl-2">
                                {aiData.next_meeting.agenda.map((a, i) => <li key={i}>{a}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })()}

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Nhật ký chat</h3>

            {chatLog.length === 0 ? (
              <div className="text-body-sm text-on-surface-variant">Chưa có tin nhắn nào trong cuộc họp này.</div>
            ) : (
              <div className="space-y-sm max-h-[500px] overflow-y-auto pr-2 custom-scrollbar rounded-lg border border-outline-variant/50 p-4 bg-surface-container-low">
                {chatLog.map((item, idx) => {
                  const isMine = Boolean(currentUser?.id) && getUserId(item.userId) === String(currentUser?.id);
                  const uId = getUserId(item.userId) || 'unknown';
                  
                  // Tính mã băm đơn giản từ userId để chọn màu cố định cho từng người
                  const hash = uId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const colorClasses = [
                    'bg-blue-100 text-blue-900 border-blue-200',
                    'bg-green-100 text-green-900 border-green-200',
                    'bg-purple-100 text-purple-900 border-purple-200',
                    'bg-pink-100 text-pink-900 border-pink-200',
                    'bg-yellow-100 text-yellow-900 border-yellow-200',
                    'bg-indigo-100 text-indigo-900 border-indigo-200',
                    'bg-teal-100 text-teal-900 border-teal-200',
                    'bg-orange-100 text-orange-900 border-orange-200',
                    'bg-cyan-100 text-cyan-900 border-cyan-200',
                    'bg-rose-100 text-rose-900 border-rose-200',
                  ];
                  
                  const bubbleColor = isMine 
                    ? 'border-primary/20 bg-primary text-on-primary' 
                    : colorClasses[hash % colorClasses.length];
                  
                  const timeColor = isMine ? 'text-on-primary/80' : 'opacity-60';

                  return (
                    <div
                      key={`${item.timestamp || idx}-${idx}`}
                      className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {!isMine && (
                        <span className="text-[11px] font-medium text-on-surface-variant ml-2">
                          {getUserName(item.userId)}
                        </span>
                      )}
                      <div
                        className={`w-fit max-w-[78%] rounded-2xl border px-3 py-2 shadow-sm ${bubbleColor} ${isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      >
                        <div className="flex flex-col">
                          <p className="text-body-sm whitespace-pre-wrap">
                            {item.content || ''}
                          </p>
                          <span className={`text-[10px] mt-1 self-end ${timeColor}`}>
                            {item.timestamp ? format(new Date(item.timestamp), 'HH:mm', { locale: vi }) : '--'}
                          </span>
                        </div>
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
