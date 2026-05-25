import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface ChannelHeaderProps {
  channelName: string;
  channelId?: string;
  workspaceId?: string;
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
  channelId,
  workspaceId,
  description,
  memberCount,
  isPrivate,
  isConnected,
  memberAvatars = [],
  onToggleSidebar,
}: ChannelHeaderProps) {
  const router = useRouter();
  const shownMembers = memberAvatars.slice(0, 3);
  const [isCreatingMeeting, setIsCreatingMeeting] = React.useState(false);

  const handleCreateMeeting = async () => {
    if (!workspaceId || !channelId) {
      toast.error('Không tìm thấy thông tin kênh để tạo cuộc họp.');
      return;
    }

    try {
      setIsCreatingMeeting(true);
      const res = await api.post(
        `/workspaces/${workspaceId}/channels/${channelId}/meetings`,
        {
          title: `Cuộc họp nhanh - ${new Date().toLocaleString('vi-VN')}`,
        }
      );

      const meetingId = res.data?.data?._id;
      if (!meetingId) {
        toast.error('Tạo cuộc họp thành công nhưng không lấy được mã cuộc họp.');
        return;
      }

      router.push(
        `/meetings?meetingId=${meetingId}&workspaceId=${workspaceId}&channelId=${channelId}`
      );
    } catch (err) {
      console.error('Không thể tạo cuộc họp:', err);
      toast.error('Không thể tạo cuộc họp. Vui lòng thử lại.');
    } finally {
      setIsCreatingMeeting(false);
    }
  };

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
          disabled={isCreatingMeeting || !workspaceId || !channelId}
          onClick={handleCreateMeeting}
          className="hidden rounded-md bg-[#0f55cc] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d49ac] disabled:opacity-50 disabled:cursor-not-allowed md:block"
        >
          {isCreatingMeeting ? 'Đang tạo...' : 'Tạo Cuộc họp'}
        </button>

        <button
          type="button"
          disabled={isCreatingMeeting || !workspaceId || !channelId}
          onClick={handleCreateMeeting}
          className="rounded-md bg-[#0f55cc] p-2 text-white transition-colors hover:bg-[#0d49ac] disabled:opacity-50 disabled:cursor-not-allowed md:hidden"
          title="Tạo Cuộc họp"
        >
          {isCreatingMeeting ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">
              videocam
            </span>
          )}
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
