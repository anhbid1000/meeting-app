import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fileApi } from '@/services/fileApi';

interface MessageComposerProps {
  channelId?: string;
  disabled?: boolean;
  mentionUsers?: Array<{ id: string; name: string }>;
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
  editTo?: {
    id: string;
    content: string;
    replyToId?: string;
  } | null;
  onCancelEdit?: () => void;
  onEditSubmit?: (messageId: string, content: string) => Promise<void>;
  onSend: (payload: {
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
    mentions?: string[];
  }) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

const EMOJI_LIST = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🥰',
  '😎',
  '🤔',
  '👏',
  '👍',
  '🙏',
  '🎉',
  '🔥',
  '💡',
  '🤝',
  '💪',
  '✅',
  '❗',
  '🚀',
  '🎯',
  '📌',
  '💬',
  '❤️',
];

const toMentionKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');

const stripLeadingReplyMarkers = (value: string) =>
  value.replace(/^(?:\[reply:[^\]]+\]\n?)+/, '');

export default function MessageComposer({
  channelId,
  disabled,
  mentionUsers = [],
  replyTo,
  onCancelReply,
  editTo,
  onCancelEdit,
  onEditSubmit,
  onSend,
  onTyping,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null
  );
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionableUsers = useMemo(
    () =>
      mentionUsers.map((user) => ({
        ...user,
        mentionKey: toMentionKey(user.name || user.id),
      })),
    [mentionUsers]
  );

  const mentionSuggestions = useMemo(() => {
    if (mentionStartIndex === null) return [];

    const q = mentionQuery.trim().toLowerCase();
    if (!q) return mentionableUsers.slice(0, 8);

    return mentionableUsers
      .filter(
        (user) =>
          user.mentionKey.includes(q) ||
          user.name.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [mentionQuery, mentionStartIndex, mentionableUsers]);

  const canSend = useMemo(
    () =>
      !disabled &&
      !sending &&
      !uploading &&
      (content.trim().length > 0 || files.length > 0),
    [disabled, sending, uploading, content, files.length]
  );

  const fileKey = (file: File, index: number) =>
    `${file.name}-${file.size}-${index}`;

  const parseMentions = (text: string) => {
    const matches = text.match(/@([\w.-]+)/g) || [];
    const handled = new Set<string>();

    matches.forEach((token) => {
      const key = token.slice(1).toLowerCase();
      const found = mentionableUsers.find(
        (user) =>
          user.mentionKey === key ||
          user.name.toLowerCase() === key ||
          user.id.toLowerCase().startsWith(key)
      );
      if (found) handled.add(found.id);
    });

    return Array.from(handled);
  };

  const resetMentionPicker = () => {
    setMentionQuery('');
    setMentionStartIndex(null);
    setActiveMentionIndex(0);
  };

  const handleMentionSelect = (user: { mentionKey: string }) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStartIndex === null) return;

    const cursor = textarea.selectionStart;
    const next =
      content.slice(0, mentionStartIndex) +
      `@${user.mentionKey} ` +
      content.slice(cursor);

    setContent(next);
    resetMentionPicker();

    requestAnimationFrame(() => {
      const pos = mentionStartIndex + user.mentionKey.length + 2;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleSubmit = async () => {
    if (!canSend) return;

    setSending(true);
    const text = content;
    const selectedFiles = files;

    try {
      if (editTo && onEditSubmit) {
        const finalEditContent = editTo.replyToId
          ? `[reply:${editTo.replyToId}]\n${text}`
          : text;
        await onEditSubmit(editTo.id, finalEditContent);
        onCancelEdit?.();
        setContent('');
        setFiles([]);
        setUploadProgress({});
        onTyping(false);
        return;
      }

      const finalContent = replyTo ? `[reply:${replyTo.id}]\n${text}` : text;
      let uploadedAttachments: Array<{
        url: string;
        name: string;
        mimeType: string;
        size: number;
      }> = [];

      if (selectedFiles.length > 0) {
        if (!channelId) {
          toast.error('Kênh chưa sẵn sàng, vui lòng thử lại sau vài giây');
          return;
        }

        setUploading(true);
        uploadedAttachments = [];

        for (let index = 0; index < selectedFiles.length; index += 1) {
          const file = selectedFiles[index];
          const key = fileKey(file, index);
          setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

          const uploaded = await fileApi.uploadFileToCloudinary(
            channelId,
            file,
            (progressPercent) => {
              setUploadProgress((prev) => ({
                ...prev,
                [key]: progressPercent,
              }));
            }
          );
          uploadedAttachments.push(uploaded);
        }
      }

      await onSend({
        content: finalContent,
        mentions: parseMentions(text),
        attachments: uploadedAttachments,
      });
      onCancelReply?.();
      setContent('');
      setFiles([]);
      setUploadProgress({});
      onTyping(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send message with attachments';
      toast.error(message);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  React.useEffect(() => {
    if (!editTo) return;
    setContent(editTo.content || '');
    setFiles([]);
    setIsEmojiOpen(false);
    resetMentionPicker();
  }, [editTo]);

  return (
    <div className="relative border-t border-[#dfe3ec] bg-[#f3f4f7] px-4 pb-4 pt-3 md:px-5 md:pb-5">
      <div className="overflow-hidden rounded-2xl border border-[#d3d8e5] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-within:border-[#95b3ef] focus-within:shadow-[0_0_0_3px_rgba(47,99,211,0.15)]">
        {editTo ? (
          <div className="flex items-start justify-between gap-2 border-b border-[#e8ebf3] bg-[#fff4e6] px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#9a5a00]">
                Editing message
              </p>
              <p className="truncate text-xs text-[#6b5a3d]">
                {editTo.content}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md p-1 text-[#687183] hover:bg-[#f6e5cf]"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        ) : replyTo ? (
          <div className="flex items-start justify-between gap-2 border-b border-[#e8ebf3] bg-[#eef3ff] px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1e4fb3]">
                Replying to {replyTo.authorName}
              </p>
              <p className="truncate text-xs text-[#5b6475]">
                {stripLeadingReplyMarkers(replyTo.content)}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="rounded-md p-1 text-[#687183] hover:bg-[#dde6ff]"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        ) : null}

        {files.length > 0 ? (
          <div className="flex flex-wrap gap-1 border-b border-[#e8ebf3] px-3 py-2">
            {files.map((file, index) => (
              <button
                key={`${file.name}-${index}`}
                type="button"
                onClick={() => {
                  setFiles((prev) => prev.filter((_, idx) => idx !== index));
                }}
                className="rounded-full border border-[#d7dae6] bg-[#f6f7fb] px-2 py-1 text-xs text-[#516070]"
              >
                {file.name}
                {uploading
                  ? ` ${uploadProgress[fileKey(file, index)] || 0}%`
                  : ''}{' '}
                x
              </button>
            ))}
          </div>
        ) : null}

        <textarea
          ref={textareaRef}
          value={content}
          disabled={disabled || sending}
          onChange={(e) => {
            const next = e.target.value;
            setContent(next);
            onTyping(next.trim().length > 0);

            const cursor = e.target.selectionStart;
            const beforeCursor = next.slice(0, cursor);
            const atIndex = beforeCursor.lastIndexOf('@');

            if (atIndex >= 0) {
              const query = beforeCursor.slice(atIndex + 1);
              if (/^[a-zA-Z0-9._-]*$/.test(query)) {
                setMentionStartIndex(atIndex);
                setMentionQuery(query);
                return;
              }
            }

            resetMentionPicker();
          }}
          onKeyDown={(e) => {
            if (mentionSuggestions.length > 0 && mentionStartIndex !== null) {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveMentionIndex((prev) =>
                  prev + 1 >= mentionSuggestions.length ? 0 : prev + 1
                );
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveMentionIndex((prev) =>
                  prev - 1 < 0 ? mentionSuggestions.length - 1 : prev - 1
                );
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const picked = mentionSuggestions[activeMentionIndex];
                if (picked) {
                  handleMentionSelect(picked);
                }
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                resetMentionPicker();
                return;
              }
            }

            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder="Message channel..."
          rows={3}
          className="min-h-[88px] w-full resize-none px-4 py-3 text-sm text-[#202632] outline-none placeholder:text-[#97a0af]"
        />

        <div className="flex items-center justify-between border-t border-[#e8ebf3] px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContent((prev) => `${prev}@`)}
              className="rounded-md p-1 text-[#687183] hover:bg-[#f2f4fa]"
              title="Mention"
            >
              <span className="material-symbols-outlined text-[20px]">
                alternate_email
              </span>
            </button>
            <label className="cursor-pointer rounded-md p-1 text-[#687183] hover:bg-[#f2f4fa]">
              <span className="material-symbols-outlined text-[20px]">
                attach_file
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const picked = Array.from(event.target.files || []);
                  setFiles((prev) => [...prev, ...picked]);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              className="rounded-md p-1 text-[#687183] hover:bg-[#f2f4fa]"
            >
              <span className="material-symbols-outlined text-[20px]">
                sentiment_satisfied
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-[#8a90a0] sm:block">
              {uploading
                ? 'Uploading attachments...'
                : editTo
                  ? 'Press Enter to save'
                  : 'Press Enter to send'}
            </p>
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={!canSend}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e5ad8] text-white hover:bg-[#1648af] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">
                {editTo ? 'check' : 'send'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mentionSuggestions.length > 0 && mentionStartIndex !== null ? (
        <div className="absolute bottom-[120px] left-6 z-20 w-72 rounded-xl border border-[#d7dcea] bg-white p-1 shadow-[0_12px_24px_rgba(15,23,42,0.15)]">
          {mentionSuggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleMentionSelect(user)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                index === activeMentionIndex
                  ? 'bg-[#edf3ff] text-[#1e4fb3]'
                  : 'text-[#2a313c] hover:bg-[#f6f8fc]'
              }`}
            >
              <span className="truncate">{user.name}</span>
              <span className="text-xs text-[#8a90a0]">@{user.mentionKey}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isEmojiOpen ? (
        <div className="absolute bottom-[76px] left-6 z-20 w-64 rounded-xl border border-[#d7dcea] bg-white p-2 shadow-[0_12px_24px_rgba(15,23,42,0.15)]">
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setContent((prev) => `${prev}${emoji}`);
                  setIsEmojiOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xl hover:bg-[#f3f6fc]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
