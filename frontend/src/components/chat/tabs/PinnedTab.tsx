import React from 'react';
import type { ChatMessage } from '@/types/message';

interface PinnedTabProps {
  messages: ChatMessage[];
}

export default function PinnedTab({ messages }: PinnedTabProps) {
  const pinned = messages.filter((message) => message.isPinned);

  if (!pinned.length) {
    return <p className="text-sm text-[#8a90a0]">No pinned messages.</p>;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8595]">
          Pinned Messages
        </p>
      </div>
      <ul className="space-y-2">
        {pinned.map((message) => (
          <li
            key={message._id}
            className="rounded-xl border border-[#e1e5ef] bg-white px-3 py-3"
          >
            <p className="mb-2 line-clamp-3 text-sm text-[#21262a]">
              {message.content}
            </p>
            <p className="text-xs text-[#8a90a0]">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
