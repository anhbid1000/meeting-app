import React from 'react';
import { useQuery } from '@tanstack/react-query';
import messageApi from '@/services/messageApi';
import type { MessageListResponse } from '@/types/message';

interface PinnedTabProps {
  channelId?: string;
}

export default function PinnedTab({ channelId }: PinnedTabProps) {
  const { data, isLoading, isFetching, isError } = useQuery<MessageListResponse>({
    queryKey: ['pinned-messages', channelId],
    queryFn: () => messageApi.getPinnedMessages(channelId as string),
    enabled: Boolean(channelId),
    staleTime: 15000,
  });

  const pinned = data?.data || [];

  if (isLoading) {
    return <p className="text-sm text-[#8a90a0]">Loading pinned messages...</p>;
  }

  if (isError) {
    return <p className="text-sm text-[#8a90a0]">Unable to load pinned messages.</p>;
  }

  if (!pinned.length) {
    return <p className="text-sm text-[#8a90a0]">No pinned messages.</p>;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7d8595]">
          Pinned Messages
        </p>
        {isFetching ? (
          <span className="text-xs text-[#8a90a0]">Refreshing...</span>
        ) : null}
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
