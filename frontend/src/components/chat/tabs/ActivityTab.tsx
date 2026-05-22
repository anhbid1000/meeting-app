import React from 'react';
import type { ChatMessage } from '@/types/message';

interface ActivityTabProps {
  messages: ChatMessage[];
}

export default function ActivityTab({ messages }: ActivityTabProps) {
  const latest = [...messages]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 20);

  if (!latest.length) {
    return <p className="text-sm text-[#8a90a0]">No activity yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {latest.map((message) => (
        <li
          key={message._id}
          className="rounded-xl border border-[#e1e5ef] bg-white px-3 py-3"
        >
          <p className="line-clamp-2 text-sm text-[#21262a]">
            {message.content || 'Message updated'}
          </p>
          <p className="mt-2 text-xs text-[#8a90a0]">
            {new Date(message.updatedAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
