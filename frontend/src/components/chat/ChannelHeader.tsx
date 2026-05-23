import React from 'react';

interface ChannelHeaderProps {
  channelName: string;
  description?: string;
  memberCount: number;
  isPrivate?: boolean;
  isConnected: boolean;
  memberAvatars?: Array<{
    id: string;
    name?: string;
    avatar?: string;
  }>;
  onToggleSidebar: () => void;
}

export default function ChannelHeader({
  channelName,
  description,
  memberCount,
  isPrivate,
  isConnected,
  memberAvatars = [],
  onToggleSidebar,
}: ChannelHeaderProps) {
  const shownMembers = memberAvatars.slice(0, 3);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#e3e7ef] bg-white px-4 md:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h1 className="truncate text-lg font-semibold text-[#1f2328] md:text-xl">
            # {channelName}
          </h1>
          {isPrivate ? (
            <span className="material-symbols-outlined text-sm text-[#7e8593]">
              lock
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-[#6d7586] md:text-sm">
          {description || 'Channel discussion and project updates'}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex -space-x-2">
            {shownMembers.map((member) => (
              <span
                key={member.id}
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#1e4fb3] text-xs font-semibold text-white"
                title={member.name || 'Member'}
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name || 'Member'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (member.name || 'U').slice(0, 1).toUpperCase()
                )}
              </span>
            ))}
            {memberCount > shownMembers.length ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#5b89d9] text-xs font-semibold text-white">
                +{Math.max(memberCount - shownMembers.length, 0)}
              </span>
            ) : null}
          </div>
          <span className="text-xs font-medium text-[#6d7586]">
            {memberCount} members
          </span>
        </div>

        <button
          type="button"
          className="rounded-md p-1.5 text-[#6d7586] transition-colors hover:bg-[#f1f3f8]"
          title="Call"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
        </button>

        <button
          type="button"
          className="hidden rounded-md bg-[#0f55cc] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d49ac] md:block"
        >
          Join Meeting
        </button>

        <button
          type="button"
          className="rounded-md bg-[#0f55cc] p-2 text-white transition-colors hover:bg-[#0d49ac] md:hidden"
          title="Join meeting"
        >
          <span className="material-symbols-outlined text-[18px]">
            videocam
          </span>
        </button>

        <div
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            isConnected
              ? 'bg-[#dff6e8] text-[#1f7a4f]'
              : 'bg-[#fff1f0] text-[#c54131]'
          }`}
        >
          {isConnected ? 'Live' : 'Offline'}
        </div>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-[#6d7586] transition-colors hover:bg-[#f1f3f8]"
          title="Collaboration panel"
        >
          <span className="material-symbols-outlined text-[20px]">
            settings
          </span>
        </button>
      </div>
    </header>
  );
}
