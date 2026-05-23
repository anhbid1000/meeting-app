import { Channel } from '@/types/channel';
import { useState } from 'react';

type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'revoked'
  | null;

interface ChannelCardProps {
  channel: Channel & {
    unreadCount?: number;
    mentionCount?: number;
    isFavorite?: boolean;
    activeNow?: number;
    lastMessagePreview?: string;
    lastActivityActor?: string;
    workspaceName?: string;
    workspaceSlug?: string;
  };
  onJoin?: (channelId: string) => void;
  onLeave?: (channelId: string) => void;
  onRequestAccess?: (channelId: string) => void;
  onToggleFavorite?: (channelId: string, isFavorite: boolean) => void;
  onCopyLink?: (channelId: string) => void;
  onViewInfo?: (channelId: string) => void;
  onOpenChannel?: (channelId: string) => void;
  onDelete?: (channelId: string) => void;
  isJoined?: boolean;
  canManageChannel?: boolean;
  canJoinWithoutRequest?: boolean;
  requestStatus?: RequestStatus;
  nowMs?: number;
}

const stripLeadingReplyMarkers = (value: string) =>
  value.replace(/^(?:\[reply:[^\]]+\]\n?)+/, '').trim();

const normalizeActorLabel = (value?: string) => {
  const actor = (value || '').trim();
  if (!actor) return 'Teammate';
  if (/^[a-f\d]{24}$/i.test(actor)) return 'Teammate';
  if (/^user\s+[a-f\d]{6,}$/i.test(actor)) return 'Teammate';
  return actor;
};

export default function ChannelCard({
  channel,
  onJoin,
  onLeave,
  onRequestAccess,
  onToggleFavorite,
  onCopyLink,
  onViewInfo,
  onOpenChannel,
  onDelete,
  isJoined = false,
  canManageChannel = false,
  canJoinWithoutRequest = false,
  requestStatus = null,
  nowMs,
}: ChannelCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isPrivate = channel.type === 'private';
  const isArchived = channel.isArchived;
  const isRequestPending = requestStatus === 'pending';
  const isRequestRejected = requestStatus === 'rejected';
  const isActionLockedByRequest =
    !canJoinWithoutRequest && (isRequestPending || isRequestRejected);

  const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) return 'No recent activity';
    const time = new Date(isoDate).getTime();
    if (Number.isNaN(time)) return 'No recent activity';

    const now = nowMs ?? 0;
    const diffSeconds = Math.floor((now - time) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const handleAction = () => {
    if (isArchived) return;
    if (isJoined) return;
    else if (isPrivate && canJoinWithoutRequest) onJoin?.(channel._id);
    else if (isPrivate && !isRequestPending && !isRequestRejected)
      onRequestAccess?.(channel._id);
    else if (!isPrivate) onJoin?.(channel._id);
  };

  const getButtonText = () => {
    if (isArchived) return 'Archived';
    if (isJoined) return 'Joined';
    if (isPrivate && canJoinWithoutRequest) return 'Join';
    if (isPrivate && isRequestPending) return 'Pending Approval';
    if (isPrivate && isRequestRejected) return 'Rejected';
    if (isPrivate) return 'Request Access';
    return 'Join';
  };

  const getButtonStyle = () => {
    if (isArchived) return 'bg-[#e7e8ea] text-[#737686] cursor-not-allowed';
    if (isJoined) return 'bg-[#e7e8ea] text-[#516070] cursor-not-allowed';
    if (!canJoinWithoutRequest && isRequestPending)
      return 'bg-[#fef7cd] text-[#7c6a00] cursor-default';
    if (!canJoinWithoutRequest && isRequestRejected)
      return 'bg-[#ffdad6] text-[#93000a] cursor-default';
    if (isPrivate && canJoinWithoutRequest)
      return 'bg-[#004ac6] text-white hover:bg-[#003ea8]';
    if (isPrivate) return 'bg-[#d5e4f8] text-[#004ac6] hover:bg-[#b9c8db]';
    return 'bg-[#004ac6] text-white hover:bg-[#003ea8]';
  };

  const latestActorLabel = normalizeActorLabel(channel.lastActivityActor);
  const latestActorInitial =
    latestActorLabel.trim().charAt(0).toUpperCase() || 'T';
  const hasLatestMessage = Boolean(
    channel.lastMessagePreview && channel.lastMessagePreview.trim()
  );
  const hasMentionUnread = isJoined && (channel.mentionCount ?? 0) > 0;

  const showLatestActivity = !isArchived && (!isPrivate || isJoined);
  const latestActivitySnippet = stripLeadingReplyMarkers(
    channel.lastMessagePreview || ''
  );

  return (
    <div className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={() => onOpenChannel?.(channel._id)}
            className="w-12 h-12 bg-[#dbe1ff] text-[#004ac6] rounded-xl flex items-center justify-center font-bold text-xl hover:bg-[#cfd9ff] cursor-pointer"
          >
            <span className="material-symbols-outlined">
              {isPrivate ? 'lock' : 'tag'}
            </span>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChannel?.(channel._id)}
                className="font-bold text-[#191c1e] hover:text-[#004ac6] cursor-pointer"
              >
                {channel.name}
              </button>
              {channel.isFavorite && (
                <span
                  className="material-symbols-outlined text-[#004ac6] text-base"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  star
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isArchived
                    ? 'bg-[#e7e8ea] text-[#737686]'
                    : isPrivate
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#d5e4f8] text-[#516070]'
                }`}
              >
                {isArchived ? 'Archived' : isPrivate ? 'Private' : 'Public'}
              </span>
              <span className="text-xs text-[#516070] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">group</span>
                {channel.memberCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#516070] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-[#c3c6d7] rounded-xl shadow-lg py-2 w-48 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onToggleFavorite?.(
                      channel._id,
                      !Boolean(channel.isFavorite)
                    );
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#191c1e] hover:bg-[#f3f4f6] flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    star
                  </span>
                  {channel.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => {
                    onCopyLink?.(channel._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#191c1e] hover:bg-[#f3f4f6] flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    link
                  </span>
                  Copy link
                </button>
                <button
                  onClick={() => {
                    onViewInfo?.(channel._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#191c1e] hover:bg-[#f3f4f6] flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    info
                  </span>
                  Channel info
                </button>
                {canManageChannel && (
                  <>
                    <div className="border-t border-[#e1e2e4] my-1" />
                    <button
                      onClick={() => {
                        onDelete?.(channel._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Delete channel
                    </button>
                  </>
                )}
                {isJoined && (
                  <>
                    <div className="border-t border-[#e1e2e4] my-1" />
                    <button
                      onClick={() => onLeave?.(channel._id)}
                      className="w-full px-4 py-2 text-left text-sm text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Leave
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {isJoined && channel.unreadCount ? (
          <span className="bg-[#004ac6] text-white text-xs px-2 py-1 rounded-full min-w-6 text-center">
            {channel.unreadCount}
          </span>
        ) : null}
      </div>

      {/* Description / Preview */}
      {showLatestActivity && (
        <div className="bg-[#f3f4f6] rounded-lg p-3 mb-4">
          {hasLatestMessage ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#dbe1ff] text-[#004ac6] text-xs font-semibold flex items-center justify-center shrink-0">
                    {latestActorInitial}
                  </div>
                  <span className="text-[15px] leading-none font-semibold text-[#191c1e]">
                    {latestActorLabel}
                  </span>
                </div>
                <p className="text-xs text-[#516070] leading-none">
                  {formatRelativeTime(channel.lastMessageAt)}
                </p>
              </div>
              <p className="text-[16px] leading-none text-[#6c757d] line-clamp-1 italic">
                &quot;{latestActivitySnippet || 'No message'}&quot;
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-[#737686]">No message</p>
          )}
        </div>
      )}

      {isPrivate && !isJoined && !isArchived && !canJoinWithoutRequest && (
        <div className="bg-[#fef7cd] rounded-lg p-3 mb-4 border border-[#e6d68a]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#7c6a00]">
              lock
            </span>
            <span className="text-xs text-[#7c6a00] font-medium">
              Private channel - Request access to view
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#516070]">
          {hasMentionUnread ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ffe9eb] px-2.5 py-1 font-semibold text-[#b3261e]">
              <span className="material-symbols-outlined text-[14px] leading-none">
                alternate_email
              </span>
              Mentioned
            </span>
          ) : null}

          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#004ac6] rounded-full"></span>
            <span>{channel.activeNow ?? 0} active now</span>
          </span>
        </div>

        <button
          onClick={handleAction}
          disabled={isJoined || isActionLockedByRequest || isArchived}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-transform active:scale-95 ${getButtonStyle()} ${isJoined || isActionLockedByRequest || isArchived ? '' : 'cursor-pointer'}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
