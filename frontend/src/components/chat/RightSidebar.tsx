import React, { useMemo, useState } from 'react';
import type { ChatMessage } from '@/types/message';
import MembersTab from './tabs/MembersTab';
import FilesTab from './tabs/FilesTab';
import PinnedTab from './tabs/PinnedTab';
import ActivityTab from './tabs/ActivityTab';

type SidebarTab = 'members' | 'files' | 'pinned' | 'activity';

interface RightSidebarProps {
  isOpen: boolean;
  members: Array<{
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    avatarUrl?: string;
    role?: 'owner' | 'admin' | 'member';
  }>;
  messages: ChatMessage[];
  onlineUsers: Record<string, true>;
  currentUserId?: string;
  onClose: () => void;
  canInvite?: boolean;
  onInvite?: () => void;
}

export default function RightSidebar({
  isOpen,
  members,
  messages,
  onlineUsers,
  currentUserId,
  onClose,
  canInvite = false,
  onInvite,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('members');

  const onlineCount = useMemo(
    () =>
      members.filter((member) =>
        Boolean(onlineUsers[member.id || member._id || ''])
      ).length,
    [members, onlineUsers]
  );

  if (!isOpen) return null;

  return (
    <aside className="hidden w-80 shrink-0 border-l border-[#dfe3ec] bg-[#f8f9fc] xl:flex xl:flex-col">
      <div className="flex items-center justify-between border-b border-[#e3e7f1] px-4 py-3">
        <h3 className="text-base font-semibold text-[#2a313c]">
          Collaboration
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[#7c8495] hover:bg-[#edf0f7]"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="border-b border-[#e3e7f1] px-3 pt-2">
        <div className="flex gap-4 px-1">
          {(
            [
              { id: 'members', label: 'Members' },
              { id: 'files', label: 'Files' },
              { id: 'pinned', label: 'Pinned' },
              { id: 'activity', label: 'Activity' },
            ] as Array<{ id: SidebarTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-[#2b61d4] text-[#2b61d4]'
                  : 'border-transparent text-[#727b8d] hover:text-[#2b61d4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {activeTab === 'members' ? (
          <MembersTab
            members={members}
            onlineUsers={onlineUsers}
            onlineCount={onlineCount}
            currentUserId={currentUserId}
          />
        ) : null}
        {activeTab === 'files' ? <FilesTab messages={messages} /> : null}
        {activeTab === 'pinned' ? <PinnedTab messages={messages} /> : null}
        {activeTab === 'activity' ? <ActivityTab messages={messages} /> : null}
      </div>

      {canInvite ? (
        <div className="border-t border-[#e3e7f1] p-3">
          <button
            type="button"
            onClick={onInvite}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d5dbe8] bg-white px-3 py-2.5 text-sm font-semibold text-[#2a313c] transition-colors hover:bg-[#f4f6fb] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              group_add
            </span>
            Invite Members
          </button>
        </div>
      ) : null}
    </aside>
  );
}
