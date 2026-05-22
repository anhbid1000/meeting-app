import React from 'react';
import MessageItem from './MessageItem';
import type { ChatMessage } from '@/types/message';

interface MessageGroupProps {
  messages: ChatMessage[];
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

const getDisplayName = (message: ChatMessage) => {
  if (message.author?.name) return message.author.name;
  if (message.author?.email) return message.author.email;
  return message.userId.slice(0, 8);
};

const getAvatarUrl = (message: ChatMessage) => {
  return message.author?.avatar || message.author?.avatarUrl;
};

export default function MessageGroup({
  messages,
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
}: MessageGroupProps) {
  const first = messages[0];
  if (!first) return null;

  if (first.type === 'system') {
    return (
      <div className="px-4 py-1 md:px-5">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isOwn={false}
            currentUserId={currentUserId}
            resolveMessageById={resolveMessageById}
            onReply={onReply}
            onStartEdit={onStartEdit}
            onDelete={onDelete}
            onPinToggle={onPinToggle}
            onOpenThread={onOpenThread}
            onToggleReaction={onToggleReaction}
            onOpenReactionDetails={onOpenReactionDetails}
            resolveUserName={resolveUserName}
          />
        ))}
      </div>
    );
  }

  const isOwnGroup = first.userId === currentUserId;
  const groupTime = new Date(first.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const displayName = isOwnGroup ? 'You' : getDisplayName(first);

  return (
    <div
      className={`px-4 py-2 md:px-5 ${isOwnGroup ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`mb-1.5 flex items-center gap-2 ${
          isOwnGroup ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isOwnGroup ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#263444] text-xs font-semibold text-white ring-2 ring-white shadow-sm">
            {getAvatarUrl(first) ? (
              <img
                src={getAvatarUrl(first)}
                alt={getDisplayName(first)}
                className="h-full w-full object-cover"
              />
            ) : (
              getDisplayName(first).slice(0, 1).toUpperCase()
            )}
          </div>
        ) : null}
        <span className="text-[15px] font-semibold text-[#1e242b]">
          {displayName}
        </span>
        <span className="text-xs text-[#748095]">{groupTime}</span>
        {isOwnGroup ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2f63d3] text-xs font-semibold text-white ring-2 ring-white shadow-sm">
            {getAvatarUrl(first) ? (
              <img
                src={getAvatarUrl(first)}
                alt={getDisplayName(first)}
                className="h-full w-full object-cover"
              />
            ) : (
              getDisplayName(first).slice(0, 1).toUpperCase()
            )}
          </div>
        ) : null}
      </div>

      <div
        className={`space-y-1 ${
          isOwnGroup ? 'ml-auto max-w-[82%]' : 'mr-auto max-w-[82%]'
        }`}
      >
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isOwn={message.userId === currentUserId}
            currentUserId={currentUserId}
            resolveMessageById={resolveMessageById}
            onReply={onReply}
            onStartEdit={onStartEdit}
            onDelete={onDelete}
            onPinToggle={onPinToggle}
            onOpenThread={onOpenThread}
            onToggleReaction={onToggleReaction}
            onOpenReactionDetails={onOpenReactionDetails}
            resolveUserName={resolveUserName}
          />
        ))}
      </div>
    </div>
  );
}
