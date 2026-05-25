import React, { useMemo } from 'react';

interface MembersTabProps {
  members: Array<{
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    avatarUrl?: string;
    role?: 'owner' | 'admin' | 'member';
  }>;
  onlineUsers: Record<string, true>;
  onlineCount?: number;
  currentUserId?: string;
}

export default function MembersTab({
  members,
  onlineUsers,
  onlineCount = 0,
  currentUserId,
}: MembersTabProps) {
  const sortedMembers = useMemo(() => {
    const roleWeight: Record<'owner' | 'admin' | 'member', number> = {
      owner: 0,
      admin: 1,
      member: 2,
    };

    return [...members].sort((a, b) => {
      const aRole = a.role || 'member';
      const bRole = b.role || 'member';
      const byRole = roleWeight[aRole] - roleWeight[bRole];
      if (byRole !== 0) return byRole;

      const aName = (a.name || a.email || a.id || '').toLowerCase();
      const bName = (b.name || b.email || b.id || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [members]);

  if (!members.length) {
    return <p className="text-sm text-[#8a90a0]">No member data available.</p>;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7d8595]">
        Online - {onlineCount}
      </p>
      <ul className="space-y-2.5">
        {sortedMembers.map((member, index) => {
          const memberId = member._id || member.id || '';
          const isOnline = memberId ? Boolean(onlineUsers[memberId]) : false;
          const isSelf =
            Boolean(currentUserId) &&
            String(memberId) === String(currentUserId || '');
          const isPrivileged =
            member.role === 'owner' || member.role === 'admin';

          return (
            <li
              key={memberId || String(index)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${
                isPrivileged
                  ? 'border border-[#d7e3ff] bg-[#f4f8ff]'
                  : 'bg-white'
              }`}
            >
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f63d3] text-xs font-semibold text-white">
                  {member.avatar || member.avatarUrl ? (
                    <img
                      src={member.avatar || member.avatarUrl}
                      alt={member.name || member.email || 'User'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    (member.name || member.email || 'U')
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    isOnline ? 'bg-[#22c55e]' : 'bg-[#9ca3af]'
                  }`}
                />
                {isPrivileged ? (
                  <span className="absolute -top-1 -left-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f59e0b] text-white shadow-sm">
                    <span className="material-symbols-outlined text-[11px]">
                      star
                    </span>
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#21262a]">
                  {member.name || member.email || 'Unknown user'}
                  {isSelf ? ' (You)' : ''}
                </p>
                <p className="truncate text-xs text-[#8a90a0]">
                  {isOnline ? 'Active now' : 'Offline'}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
