import React, { useMemo, useState } from 'react';
import type { ChatMessage } from '@/types/message';

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId?: string;
  resolveMessageById?: (messageId: string) => ChatMessage | undefined;
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

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '😮'];

export default function MessageItem({
  message,
  isOwn,
  currentUserId,
  resolveMessageById,
  onReply,
  onStartEdit,
  onDelete,
  onPinToggle,
  onOpenThread,
  onToggleReaction,
  onOpenReactionDetails,
  resolveUserName,
}: MessageItemProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const stripLeadingReplyMarkers = (value: string) =>
    value.replace(/^(?:\[reply:[^\]]+\]\n?)+/, '');

  const sanitizeRoleText = (value: string) =>
    value
      .replace(/\s*\((owner|admin|member)\)\s*/gi, ' ')
      .replace(/\s*-\s*(owner|admin|member)\s*/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

  const sentAt = useMemo(() => {
    return new Date(message.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [message.createdAt]);

  const replyMeta = useMemo(() => {
    if (message.isDeleted) return null;

    const match = message.content.match(/^\[reply:([^\]]+)\]\n?/);
    if (!match) return null;

    return {
      replyToId: match[1],
      body: stripLeadingReplyMarkers(message.content),
    };
  }, [message.content, message.isDeleted]);

  const label = message.isDeleted
    ? 'This message was deleted'
    : replyMeta
      ? replyMeta.body
      : message.content;

  const repliedMessage = replyMeta?.replyToId
    ? resolveMessageById?.(replyMeta.replyToId)
    : undefined;

  const repliedAuthor =
    repliedMessage?.author?.name ||
    repliedMessage?.author?.email ||
    (replyMeta?.replyToId
      ? `Message ${replyMeta.replyToId.slice(0, 6)}`
      : 'Message');
  const repliedPreviewRaw = repliedMessage?.content || '';
  const repliedPreview = repliedPreviewRaw
    ? stripLeadingReplyMarkers(repliedPreviewRaw)
    : 'Original message';
  const repliedPreviewShort =
    repliedPreview.length > 60
      ? `${repliedPreview.slice(0, 60)}...`
      : repliedPreview;

  const normalizedSystemText = useMemo(() => {
    const raw = message.content || '';
    if (!raw) return raw;

    const withoutMarker = raw
      .replace(/^\[(PIN|UNPIN|MEMBER_JOIN|MEMBER_LEAVE)\]\s*/i, '')
      .trim();

    if (/pinned a message\s*:/i.test(withoutMarker)) {
      return withoutMarker.replace(/\s*:\s*.*$/i, '');
    }
    if (/unpinned a message\s*:/i.test(withoutMarker)) {
      return withoutMarker.replace(/\s*:\s*.*$/i, '');
    }

    return sanitizeRoleText(withoutMarker);
  }, [message.content]);

  const systemActorName = useMemo(() => {
    const rawName = message.author?.name || message.author?.email || 'Teammate';
    return sanitizeRoleText(rawName);
  }, [message.author?.name, message.author?.email]);

  const systemActionText = useMemo(() => {
    const text = normalizedSystemText;
    const actor = systemActorName;

    if (!text) return text;
    if (!actor) return text;

    const escapedActor = actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const actorPrefix = new RegExp(`^${escapedActor}\\s*`, 'i');
    const trimmed = text.replace(actorPrefix, '').trim();
    return trimmed || text;
  }, [normalizedSystemText, systemActorName]);

  if (message.type === 'system') {
    const actorInitial = systemActorName.trim().charAt(0).toUpperCase() || 'T';

    return (
      <div id={`message-${message._id}`} className="my-3 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-[#d9e2f6] bg-[#f4f8ff] px-3 py-1.5 text-xs text-[#42526e] shadow-sm">
          {message.author?.avatar ? (
            <img
              src={message.author.avatar}
              alt={systemActorName}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#dbe7ff] text-[11px] font-semibold text-[#2a4c97]">
              {actorInitial}
            </span>
          )}
          <span className="font-semibold text-[#2f4a85]">
            {systemActorName}
          </span>
          <span className="text-[#58657d]">{systemActionText}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-${message._id}`}
      className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative flex max-w-[95%] items-end gap-2 md:max-w-[86%] ${
          isOwn ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {!message.isDeleted ? (
          <div
            className={`flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <button
              type="button"
              onClick={() => onReply(message._id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dce6] bg-white text-[#5f697d] shadow-sm hover:bg-[#f3f5fb] cursor-pointer"
              title="Reply"
            >
              <span className="material-symbols-outlined text-[16px]">
                reply
              </span>
            </button>
            <button
              type="button"
              onClick={() => onOpenThread(message._id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dce6] bg-white text-[#5f697d] shadow-sm hover:bg-[#f3f5fb] cursor-pointer"
              title="Open thread"
            >
              <span className="material-symbols-outlined text-[16px]">
                forum
              </span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowReactionPicker((prev) => !prev);
                  setShowMoreMenu(false);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dce6] bg-white text-[#5f697d] shadow-sm hover:bg-[#f3f5fb] cursor-pointer"
                title="Add reaction"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add_reaction
                </span>
              </button>

              {showReactionPicker ? (
                <div
                  className={`absolute z-20 mt-1 flex items-center gap-1 rounded-xl border border-[#d8dce6] bg-white p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.16)] ${
                    isOwn ? 'left-0' : 'right-0'
                  }`}
                >
                  {REACTION_EMOJIS.map((emoji) => {
                    const existing = (message.reactions || []).find(
                      (reaction) => reaction.emoji === emoji
                    );
                    const hasReacted = Boolean(
                      existing?.users?.some(
                        (userId) =>
                          String(userId) === String(currentUserId || '')
                      )
                    );

                    return (
                      <button
                        key={`${message._id}-${emoji}`}
                        type="button"
                        onClick={() => {
                          onToggleReaction(message._id, emoji, hasReacted);
                          setShowReactionPicker(false);
                        }}
                        className={`cursor-pointer rounded-lg px-1.5 py-1 text-sm transition-colors ${
                          hasReacted ? 'bg-[#e8efff]' : 'hover:bg-[#f3f5fb]'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu((prev) => !prev);
                  setShowReactionPicker(false);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dce6] bg-white text-[#5f697d] shadow-sm hover:bg-[#f3f5fb] cursor-pointer"
                title="More actions"
              >
                <span className="material-symbols-outlined text-[16px]">
                  more_horiz
                </span>
              </button>

              {showMoreMenu ? (
                <div
                  className={`absolute z-20 mt-1 w-36 rounded-xl border border-[#d8dce6] bg-white p-1 shadow-[0_10px_24px_rgba(15,23,42,0.16)] ${
                    isOwn ? 'left-0' : 'right-0'
                  }`}
                >
                  {isOwn ? (
                    <button
                      type="button"
                      onClick={() => {
                        onStartEdit({
                          messageId: message._id,
                          content: label,
                          replyToId: replyMeta?.replyToId,
                        });
                        setShowMoreMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-[#2e3440] hover:bg-[#f3f5fb]"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        edit
                      </span>
                      Edit
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      onPinToggle(message._id, message.isPinned);
                      setShowMoreMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-[#2e3440] hover:bg-[#f3f5fb]"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {message.isPinned ? 'keep_off' : 'keep'}
                    </span>
                    {message.isPinned ? 'Unpin' : 'Pin'}
                  </button>

                  {isOwn ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(message._id);
                        setShowMoreMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-[#c54131] hover:bg-[#fff3f1]"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        delete
                      </span>
                      Delete
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={`relative rounded-2xl px-3 py-2.5 ${
            isOwn
              ? 'bg-[#2f63d3] text-white shadow-[0_6px_14px_rgba(47,99,211,0.24)]'
              : 'border border-[#e2e6ef] bg-white text-[#21262a] shadow-[0_2px_6px_rgba(15,23,42,0.06)]'
          }`}
        >
          {message.isPinned ? (
            <span
              className={`absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} flex h-5 w-5 items-center justify-center rounded-full border border-[#d8dce6] bg-white text-[#4f6fb8] shadow-sm`}
              title="Pinned"
            >
              <span className="material-symbols-outlined text-[13px]">
                push_pin
              </span>
            </span>
          ) : null}

          {replyMeta ? (
            <button
              type="button"
              onClick={() => {
                if (!replyMeta.replyToId) return;
                const target = document.getElementById(
                  `message-${replyMeta.replyToId}`
                );
                target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`mb-2 rounded-lg border-l-2 px-2 py-1 text-xs ${
                isOwn
                  ? 'border-white/70 bg-white/20 text-white/90'
                  : 'border-[#9ab4ef] bg-[#edf3ff] text-[#37518c]'
              }`}
            >
              Replying to {repliedAuthor}: {repliedPreviewShort}
            </button>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <p
              className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${
                message.isDeleted
                  ? isOwn
                    ? 'italic text-white/80'
                    : 'italic text-[#8a90a0]'
                  : isOwn
                    ? 'text-white'
                    : 'text-[#21262a]'
              }`}
            >
              {label}
            </p>
            <span
              className={`shrink-0 text-[11px] ${isOwn ? 'text-white/80' : 'text-[#8a90a0]'}`}
            >
              {sentAt}
            </span>
          </div>

          {message.attachments && message.attachments.length > 0 ? (
            <div className="mt-2 space-y-2">
              {message.attachments.map((file) => (
                <a
                  key={`${message._id}-${file.url}`}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between gap-3 rounded-xl border px-2.5 py-2 text-xs ${
                    isOwn
                      ? 'border-white/30 bg-white/15 text-white hover:bg-white/25'
                      : 'border-[#d7dae6] bg-[#f8f9fc] text-[#004ac6] hover:bg-[#eef3ff]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px]">
                      description
                    </span>
                    <span className="truncate">{file.name}</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    download
                  </span>
                </a>
              ))}
            </div>
          ) : null}

          {message.reactions && message.reactions.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {message.reactions
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((reaction) => {
                  const hasReacted = Boolean(
                    (reaction.users || []).some(
                      (userId) => String(userId) === String(currentUserId || '')
                    )
                  );
                  const reactedNames = (reaction.users || []).map((userId) => {
                    const normalizedId = String(userId);
                    if (normalizedId === String(currentUserId || '')) {
                      return 'You';
                    }
                    if (resolveUserName) {
                      return resolveUserName(normalizedId);
                    }
                    return `User ${normalizedId.slice(0, 8)}`;
                  });
                  const tooltip =
                    reactedNames.length > 0
                      ? `Reacted by: ${reactedNames.join(', ')}`
                      : 'No reactions';

                  return (
                    <button
                      key={`${message._id}-${reaction.emoji}`}
                      type="button"
                      onClick={() => onOpenReactionDetails(message._id)}
                      className={`cursor-pointer inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                        hasReacted
                          ? isOwn
                            ? 'border-white/70 bg-white/25 text-white'
                            : 'border-[#a8bdf1] bg-[#edf3ff] text-[#244a97]'
                          : isOwn
                            ? 'border-white/40 bg-white/10 text-white/90 hover:bg-white/20'
                            : 'border-[#d3d8e5] bg-white text-[#586173] hover:bg-[#f5f7fc]'
                      }`}
                      title={tooltip}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="font-medium">{reaction.count}</span>
                    </button>
                  );
                })}
            </div>
          ) : null}

          <div
            className={`mt-1 flex flex-wrap items-center gap-2 text-[11px] ${isOwn ? 'text-white/80' : 'text-[#8a90a0]'}`}
          >
            {message.isEdited ? <span>edited</span> : null}
            {message.threadCount > 0 ? (
              <button
                type="button"
                onClick={() => onOpenThread(message._id)}
                className="cursor-pointer hover:underline"
              >
                {message.threadCount} replies
              </button>
            ) : null}
            {message.isPinned ? (
              <span className={isOwn ? 'text-white' : 'text-[#004ac6]'}>
                pinned
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
