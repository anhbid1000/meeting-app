import React, { useEffect, useMemo, useRef } from 'react';
import MessageGroup from './MessageGroup';
import type { ChatMessage } from '@/types/message';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  unreadSince?: string | null;
  forceScrollToken?: number;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadOlder: () => void;
  onUserActivity?: () => void;
  onReply: (messageId: string) => void;
  onStartEdit: (payload: {
    messageId: string;
    content: string;
    replyToId?: string;
  }) => void;
  onDelete: (messageId: string) => void;
  onPinToggle: (messageId: string, isPinned: boolean) => void;
  onOpenThread: (messageId: string) => void;
  onToggleReaction: (
    messageId: string,
    emoji: string,
    hasReacted: boolean
  ) => void;
  onOpenReactionDetails: (messageId: string) => void;
  resolveUserName?: (userId: string) => string;
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const getDayKey = (isoDate?: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatDayLabel = (isoDate?: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const todayKey = getDayKey(now.toISOString());
  const targetKey = getDayKey(isoDate);
  if (targetKey === todayKey) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday.toISOString());
  if (targetKey === yesterdayKey) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export default function MessageList({
  messages,
  currentUserId,
  unreadSince,
  forceScrollToken,
  hasMore,
  isFetchingMore,
  onLoadOlder,
  onUserActivity,
  onReply,
  onStartEdit,
  onDelete,
  onPinToggle,
  onOpenThread,
  onToggleReaction,
  onOpenReactionDetails,
  resolveUserName,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const previousCountRef = useRef(0);

  const groups = useMemo(() => {
    const result: ChatMessage[][] = [];
    for (const message of messages) {
      const lastGroup = result[result.length - 1];
      const lastMessage = lastGroup?.[lastGroup.length - 1];

      if (!lastMessage) {
        result.push([message]);
        continue;
      }

      const sameUser = lastMessage.userId === message.userId;
      const closeInTime =
        Math.abs(
          new Date(message.createdAt).getTime() -
            new Date(lastMessage.createdAt).getTime()
        ) <= GROUP_WINDOW_MS;

      if (sameUser && closeInTime) {
        lastGroup.push(message);
      } else {
        result.push([message]);
      }
    }
    return result;
  }, [messages]);

  const messageById = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    messages.forEach((message) => {
      map.set(message._id, message);
    });
    return map;
  }, [messages]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    onUserActivity?.();
    const target = event.currentTarget;
    if (target.scrollTop < 120 && hasMore && !isFetchingMore) {
      onLoadOlder();
    }
  };

  const firstUnreadMessageId = useMemo(() => {
    if (!unreadSince) return null;
    const unreadSinceTs = new Date(unreadSince).getTime();
    if (!Number.isFinite(unreadSinceTs)) return null;

    const firstUnread = messages.find(
      (message) =>
        new Date(message.createdAt).getTime() > unreadSinceTs &&
        String(message.userId) !== String(currentUserId || '')
    );

    return firstUnread?._id || null;
  }, [messages, unreadSince, currentUserId]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const previousCount = previousCountRef.current;
    const nextCount = messages.length;

    if (nextCount === 0) {
      previousCountRef.current = 0;
      return;
    }

    const distanceToBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    const shouldStickToBottom = previousCount === 0 || distanceToBottom < 140;

    if (nextCount > previousCount && shouldStickToBottom) {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }

    previousCountRef.current = nextCount;
  }, [messages]);

  useEffect(() => {
    if (!forceScrollToken) return;
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [forceScrollToken]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="chat-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#f5f7fb] px-3 py-4 md:px-4"
    >
      {hasMore ? (
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={isFetchingMore}
            className="rounded-full border border-[#ccd2e2] bg-white px-3 py-1 text-xs font-medium text-[#586173] hover:bg-[#f5f7fc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingMore
              ? 'Loading older messages...'
              : 'Load older messages'}
          </button>
        </div>
      ) : null}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-[#dfe4ef] bg-white px-6 py-10 text-center text-sm text-[#8a90a0]">
          No messages yet. Start the conversation.
        </div>
      ) : null}

      <div className="space-y-2 pb-2">
        {groups.map((group, index) => (
          <React.Fragment key={group[0]._id}>
            {index === 0 ||
            getDayKey(group[0]?.createdAt) !==
              getDayKey(groups[index - 1]?.[0]?.createdAt) ? (
              <div className="mb-5 mt-2 flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-[#d8dde8]" />
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#6f7a91] shadow-sm">
                  {formatDayLabel(group[0]?.createdAt)}
                </span>
                <div className="h-px flex-1 bg-[#d8dde8]" />
              </div>
            ) : null}

            {firstUnreadMessageId &&
            group.some((message) => message._id === firstUnreadMessageId) ? (
              <div className="my-4 flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-[#f0a8ad]" />
                <span className="rounded-full bg-[#ffe7e9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#a9343d]">
                  New messages
                </span>
                <div className="h-px flex-1 bg-[#f0a8ad]" />
              </div>
            ) : null}

            <MessageGroup
              messages={group}
              currentUserId={currentUserId}
              resolveMessageById={(id) => messageById.get(id)}
              onReply={onReply}
              onStartEdit={onStartEdit}
              onDelete={onDelete}
              onPinToggle={onPinToggle}
              onOpenThread={onOpenThread}
              onToggleReaction={onToggleReaction}
              onOpenReactionDetails={onOpenReactionDetails}
              resolveUserName={resolveUserName}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
