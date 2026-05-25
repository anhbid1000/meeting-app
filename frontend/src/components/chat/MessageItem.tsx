import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
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
const FILE_ONLY_SENTINEL_CONTENT = '[attachment]';
const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';
const PDF_MIME = 'application/pdf';
const OFFICE_MIME_PATTERNS = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const normalizeCloudinaryFileUrl = (url: string, mimeType?: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('res.cloudinary.com')) return url;

    const normalizedMime = String(mimeType || '').toLowerCase();
    const isImage = normalizedMime.startsWith('image/');
    const isVideo = normalizedMime.startsWith('video/');

    if (!isImage && !isVideo) {
      parsed.pathname = parsed.pathname
        .replace('/image/upload/', '/raw/upload/')
        .replace('/auto/upload/', '/raw/upload/')
        .replace('/video/upload/', '/raw/upload/');
    }

    return parsed.toString();
  } catch {
    return url;
  }
};

const getFileCategory = (mimeType?: string) => {
  const normalizedMime = String(mimeType || '').toLowerCase();
  if (normalizedMime.startsWith(IMAGE_MIME_PREFIX)) return 'image';
  if (normalizedMime.startsWith(VIDEO_MIME_PREFIX)) return 'video';
  if (normalizedMime === PDF_MIME) return 'pdf';
  if (OFFICE_MIME_PATTERNS.includes(normalizedMime)) return 'office';
  return 'file';
};

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeLabel = (mimeType?: string) => {
  const category = getFileCategory(mimeType);
  if (category === 'image') return 'Image';
  if (category === 'video') return 'Video';
  if (category === 'pdf') return 'PDF Document';
  if (category === 'office') return 'Office Document';
  return 'File';
};

const getFileIcon = (mimeType?: string) => {
  const category = getFileCategory(mimeType);
  if (category === 'image') return 'image';
  if (category === 'video') return 'movie';
  if (category === 'pdf') return 'picture_as_pdf';
  if (category === 'office') return 'description';
  return 'draft';
};

const getPreviewBackground = (mimeType?: string, isOwn?: boolean) => {
  const category = getFileCategory(mimeType);
  if (category === 'image') return 'bg-[#eef4ff]';
  if (category === 'pdf') return isOwn ? 'bg-white/15' : 'bg-[#eef0f4]';
  if (category === 'office') return isOwn ? 'bg-white/15' : 'bg-[#eef0f4]';
  return isOwn ? 'bg-white/15' : 'bg-[#eff2f7]';
};

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
  const isFileOnlySentinel =
    (label || '').trim() === FILE_ONLY_SENTINEL_CONTENT &&
    (message.attachments || []).length > 0;
  const shouldShowMessageText =
    message.isDeleted ||
    (Boolean((label || '').trim().length > 0) && !isFileOnlySentinel);
  const isFileOnlyMessage =
    !message.isDeleted &&
    !replyMeta &&
    (message.attachments || []).length > 0 &&
    !shouldShowMessageText;

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

  if (message.type === 'meeting') {
    let parsed: any = null;
    try {
      parsed = JSON.parse(message.content);
    } catch {
      parsed = { title: message.content };
    }

    const meetingTitle = parsed.title || 'Cuộc họp mới';
    const isEnded = parsed.status === 'ended' || message.content.toLowerCase().includes('đã kết thúc');

    return (
      <div id={`message-${message._id}`} className="my-4 flex w-full justify-center">
        <div className="flex w-[280px] sm:w-[400px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#d9e2f6] bg-white shadow-sm">
          <div className="flex items-center gap-3 bg-[#f0f4ff] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2f63d3] text-white">
              <span className="material-symbols-outlined text-[20px]">
                {isEnded ? 'event_available' : 'videocam'}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h4 className="truncate text-sm font-bold text-[#1a2b4b]">
                {isEnded ? 'Cuộc họp đã kết thúc' : 'Cuộc họp đang diễn ra'}
              </h4>
              <p className="truncate text-xs text-[#58657d]">{meetingTitle}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#eef2fc] bg-white px-4 py-3">
            <div className="text-[11px] text-[#8a90a0]">
              Bắt đầu lúc {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {!isEnded && (
              <button
                type="button"
                onClick={() => {
                  const meetingId = parsed.meetingId || message._id;
                  const url = parsed.url || `/meetings?meetingId=${meetingId}`;
                  window.open(url, '_blank');
                }}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-[#2f63d3] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1e4fb3]"
              >
                Tham gia ngay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
        className={`relative flex max-w-[95%] items-end gap-2 md:max-w-[86%] ${isOwn ? 'flex-row' : 'flex-row-reverse'
          }`}
      >
        {!message.isDeleted ? (
          <div
            className={`flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${isOwn ? 'justify-end' : 'justify-start'
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
                  className={`absolute z-20 mt-1 flex items-center gap-1 rounded-xl border border-[#d8dce6] bg-white p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.16)] ${isOwn ? 'left-0' : 'right-0'
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
                        className={`cursor-pointer rounded-lg px-1.5 py-1 text-sm transition-colors ${hasReacted ? 'bg-[#e8efff]' : 'hover:bg-[#f3f5fb]'
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
                  className={`absolute z-20 mt-1 w-36 rounded-xl border border-[#d8dce6] bg-white p-1 shadow-[0_10px_24px_rgba(15,23,42,0.16)] ${isOwn ? 'left-0' : 'right-0'
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
          className={`relative rounded-2xl px-3 py-2.5 ${isOwn && !isFileOnlyMessage
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
              className={`mb-2 rounded-lg border-l-2 px-2 py-1 text-xs ${isOwn
                  ? 'border-white/70 bg-white/20 text-white/90'
                  : 'border-[#9ab4ef] bg-[#edf3ff] text-[#37518c]'
                }`}
            >
              Replying to {repliedAuthor}: {repliedPreviewShort}
            </button>
          ) : null}

          <div className="flex items-start justify-between gap-3">
            {shouldShowMessageText ? (
              <p
                className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${message.isDeleted
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
            ) : null}
            <span
              className={`shrink-0 text-[11px] ${isOwn ? 'text-white/80' : 'text-[#8a90a0]'}`}
            >
              {sentAt}
            </span>
          </div>

          {message.attachments && message.attachments.length > 0 ? (
            <div className="mt-2 space-y-2">
              {message.attachments.map((file) => {
                const fileUrl = normalizeCloudinaryFileUrl(file.url, file.mimeType);
                const fileCategory = getFileCategory(file.mimeType);
                const isImage = fileCategory === 'image';
                const attachmentTitle = file.name || 'Tập tin đính kèm';
                const openAttachment = () => {
                  window.open(fileUrl, '_blank', 'noopener,noreferrer');
                };

                return (
                  <div
                    key={`${message._id}-${file.url}`}
                    className={`w-full max-w-[360px] overflow-hidden rounded-2xl border text-xs ${isOwn && !isFileOnlyMessage
                        ? 'border-white/25 bg-white/10 text-white'
                        : 'border-[#d7dae6] bg-white text-[#1f2937] shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                      }`}
                  >
                    {isImage ? (
                      <button
                        type="button"
                        onClick={openAttachment}
                        className="block h-44 w-full overflow-hidden bg-[#eef4ff] text-left"
                        title="Xem tập tin"
                      >
                        <img
                          src={fileUrl}
                          alt={attachmentTitle}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : null}

                    <div className="flex items-center gap-3 px-3 py-3">
                      <button
                        type="button"
                        onClick={openAttachment}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        title="Xem tập tin"
                      >
                        <span
                          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isOwn && !isFileOnlyMessage
                              ? 'bg-white/15 text-white'
                              : 'bg-[#ffe3dd] text-[#c94938]'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            {getFileIcon(file.mimeType)}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[14px] font-semibold leading-5 ${isOwn && !isFileOnlyMessage
                                ? 'text-white'
                                : 'text-[#172033]'
                              }`}
                          >
                            {attachmentTitle}
                          </span>
                          <span
                            className={`mt-0.5 block truncate text-xs ${isOwn && !isFileOnlyMessage
                                ? 'text-white/80'
                                : 'text-[#5f6b7e]'
                              }`}
                          >
                            {formatFileSize(file.size)} • {getFileTypeLabel(file.mimeType)}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={openAttachment}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${isOwn && !isFileOnlyMessage
                            ? 'border-white/20 text-white hover:bg-white/15'
                            : 'border-[#d6ddea] text-[#44628f] hover:bg-[#eef3fb]'
                          }`}
                        title="Xem tập tin"
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          visibility
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
                      className={`cursor-pointer inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${hasReacted
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
