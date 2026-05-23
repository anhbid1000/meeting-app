import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocketStore } from '@/store/socketStore';
import {
  useCreateThreadReply,
  useDeleteThreadReply,
  useSortedThreadReplies,
  useThreadReplies,
} from '@/hooks/useThreadReplies';
import type { ChatMessage } from '@/types/message';

const stripLeadingReplyMarkers = (value: string) =>
  value.replace(/^(?:\[reply:[^\]]+\]\n?)+/, '');

interface ThreadPanelProps {
  isOpen: boolean;
  message: ChatMessage | null;
  currentUserId?: string;
  onClose: () => void;
}

export default function ThreadPanel({
  isOpen,
  message,
  currentUserId,
  onClose,
}: ThreadPanelProps) {
  const [replyContent, setReplyContent] = useState('');
  const socket = useSocketStore((state) => state.socket);

  const messageId = message?._id || '';
  const { data, refetch, isLoading } = useThreadReplies(messageId, isOpen);
  const createReply = useCreateThreadReply(messageId);
  const deleteReply = useDeleteThreadReply(messageId);
  const replies = useSortedThreadReplies(data?.data);

  const originalContent = useMemo(() => {
    if (!message) return '';
    return stripLeadingReplyMarkers(message.content);
  }, [message]);

  useEffect(() => {
    if (!socket || !isOpen || !messageId) return;

    const onThreadChanged = (payload: { parentMessageId?: string }) => {
      if (String(payload?.parentMessageId || '') !== String(messageId)) return;
      void refetch();
    };

    socket.on('thread:reply:new', onThreadChanged);
    socket.on('thread:reply:update', onThreadChanged);
    socket.on('thread:reply:delete', onThreadChanged);

    return () => {
      socket.off('thread:reply:new', onThreadChanged);
      socket.off('thread:reply:update', onThreadChanged);
      socket.off('thread:reply:delete', onThreadChanged);
    };
  }, [socket, isOpen, messageId, refetch]);

  const handleSend = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    try {
      await createReply.mutateAsync({ content: trimmed });
      setReplyContent('');
    } catch {
      toast.error('Cannot send thread reply');
    }
  };

  const handleDelete = async (replyId: string) => {
    try {
      await deleteReply.mutateAsync(replyId);
    } catch {
      toast.error('Cannot delete thread reply');
    }
  };

  if (!isOpen || !message) return null;

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-[#e3e7ef] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e7ef] bg-white px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1f2328]">
            Thread discussion
          </h3>
          <p className="mt-0.5 text-xs text-[#6d7586]">
            Focused replies on this message
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md border border-[#d3d8e5] bg-white px-2 py-1 text-xs font-medium text-[#5b6475] transition-colors hover:bg-[#f1f3f8]"
        >
          Close
        </button>
      </div>

      <div className="border-b border-[#e8ebf3] px-4 py-3">
        <p className="mb-2 text-xs font-medium text-[#6d7586]">
          Original message
        </p>
        <div className="rounded-2xl border border-[#e2e6ef] bg-[#f8faff] px-3 py-2.5 text-sm text-[#21262a]">
          {originalContent}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f8f9fc] px-4 py-3">
        {isLoading ? (
          <p className="text-xs text-[#6d7586]">Loading replies...</p>
        ) : replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d3d8e5] bg-white p-3 text-xs text-[#6d7586]">
            No replies yet. Start the thread.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {replies.map((reply) => {
              const authorName =
                reply.author?.name || reply.author?.email || 'Unknown user';
              const isOwn =
                String(reply.userId) === String(currentUserId || '');
              const initial = authorName.trim().charAt(0).toUpperCase() || 'U';

              return (
                <li
                  key={reply._id}
                  className="rounded-2xl border border-[#e2e6ef] bg-white px-3 py-2.5 shadow-[0_2px_6px_rgba(15,23,42,0.06)]"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbe7ff] text-[11px] font-semibold text-[#2a4c97]">
                        {initial}
                      </div>
                      <p className="truncate text-xs font-semibold text-[#3a4250]">
                        {authorName}
                        {isOwn ? ' (You)' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-[#8a90a0]">
                        {new Date(reply.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isOwn && !reply.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(reply._id);
                          }}
                          className="cursor-pointer rounded-md px-1.5 py-0.5 text-[11px] font-medium text-[#c54131] transition-colors hover:bg-[#fff3f1]"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p
                    className={`whitespace-pre-wrap break-words text-sm ${
                      reply.isDeleted
                        ? 'italic text-[#8a90a0]'
                        : 'text-[#202632]'
                    }`}
                  >
                    {reply.content}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-[#e3e7ef] bg-white px-3 py-3">
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Reply in thread..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-[#d3d8e5] px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors focus:border-[#95b3ef]"
        />
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            disabled={createReply.isPending || !replyContent.trim()}
            onClick={() => {
              void handleSend();
            }}
            className="cursor-pointer rounded-lg bg-[#1e5ad8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1648af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reply
          </button>
        </div>
      </div>
    </aside>
  );
}
