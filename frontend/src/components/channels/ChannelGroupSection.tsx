import { useState } from 'react';
import { Channel } from '@/types/channel';
import ChannelCard from './ChannelCard';

interface ChannelGroupSectionProps {
  groupTitle: string;
  nowMs: number;
  channels: (Channel & {
    unreadCount?: number;
    isFavorite?: boolean;
    activeNow?: number;
    lastMessagePreview?: string;
    lastActivityActor?: string;
    canManageChannel?: boolean;
    canJoinWithoutRequest?: boolean;
  })[];
  onJoin?: (channelId: string) => void;
  onLeave?: (channelId: string) => void;
  onRequestAccess?: (channelId: string) => void;
  onToggleFavorite?: (channelId: string, isFavorite: boolean) => void;
  onCopyLink?: (channelId: string) => void;
  onViewInfo?: (channelId: string) => void;
  onOpenChannel?: (channelId: string) => void;
  onDelete?: (channelId: string) => void;
  joinedChannelIds?: string[];
  requestStatusByChannelId?: Record<
    string,
    'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked'
  >;
}

export default function ChannelGroupSection({
  groupTitle,
  nowMs,
  channels,
  onJoin,
  onLeave,
  onRequestAccess,
  onToggleFavorite,
  onCopyLink,
  onViewInfo,
  onOpenChannel,
  onDelete,
  joinedChannelIds = [],
  requestStatusByChannelId = {},
}: ChannelGroupSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!channels.length) return null;

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-wrap text-left">
          <span
            className={`material-symbols-outlined text-[#516070] group-hover:text-[#004ac6] transition-all ${isCollapsed ? '-rotate-90' : ''}`}
          >
            expand_more
          </span>
          <h3 className="text-xl font-semibold text-[#191c1e]">{groupTitle}</h3>
          <span className="bg-[#e7e8ea] text-[#516070] text-xs px-4 py-1 rounded-full">
            {channels.length} Channels
          </span>
        </div>
      </button>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <ChannelCard
              key={channel._id}
              channel={channel}
              nowMs={nowMs}
              onJoin={onJoin}
              onLeave={onLeave}
              onRequestAccess={onRequestAccess}
              onToggleFavorite={onToggleFavorite}
              onCopyLink={onCopyLink}
              onViewInfo={onViewInfo}
              onOpenChannel={onOpenChannel}
              onDelete={onDelete}
              isJoined={joinedChannelIds.includes(channel._id)}
              canManageChannel={Boolean(channel.canManageChannel)}
              canJoinWithoutRequest={Boolean(channel.canJoinWithoutRequest)}
              requestStatus={requestStatusByChannelId[channel._id] || null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
