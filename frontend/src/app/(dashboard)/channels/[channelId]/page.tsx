'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useMyWorkspaces } from '@/hooks/useWorkspaces';
import { channelApi } from '@/services/channelApi';
import ChannelHeader from '@/components/chat/ChannelHeader';
import MessageList from '@/components/chat/MessageList';
import MessageComposer from '@/components/chat/MessageComposer';
import TypingIndicator from '@/components/chat/TypingIndicator';
import RightSidebar from '@/components/chat/RightSidebar';
import ThreadPanel from '@/components/chat/ThreadPanel';
import InviteMembersDialog from '@/components/chat/InviteMembersDialog';
import {
  useMessages,
  useDeleteMessage,
  useEditMessage,
  usePinMessage,
  useUnpinMessage,
} from '@/hooks/useMessages';
import { useMessageStore } from '@/store/messageStore';
import { useSocketStore } from '@/store/socketStore';
import { applyDevAuthFromUrlOrFallback } from '@/lib/devAuth';
import type { Channel } from '@/types/channel';
import type { ChatMessage } from '@/types/message';

interface ChannelPageProps {
  params: Promise<{
    channelId: string;
  }>;
}

const shortId = (value: string) => value.slice(0, 8);
const stripLeadingReplyMarkers = (value: string) =>
  value.replace(/^(?:\[reply:[^\]]+\]\n?)+/, '');

type MemberProfile = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'owner' | 'admin' | 'member';
};

type MeetingBannerData = {
  key: string;
  title: string;
  status: 'live' | 'ended' | 'scheduled';
  participantsCount: number;
};

type ChannelMemberRow = {
  userId?: { _id?: string } | string;
  role?: 'owner' | 'admin' | 'member';
};

type MeetingPayload = {
  channelId?: string;
  meetingId?: string;
  id?: string;
  title?: string;
  status?: string;
  participantsCount?: number;
  participants?: unknown[];
};

type MeetingContent = {
  status?: string;
  title?: string;
  participantsCount?: number;
  participants?: unknown[];
};

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelId: channelKey } = use(params);
  const router = useRouter();
  const isLegacyObjectId = /^[a-f\d]{24}$/i.test(channelKey);
  const isValidChannelSegment = /^[a-z\d-]{1,120}$/i.test(channelKey);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dismissedMeetingKey, setDismissedMeetingKey] = useState<string | null>(
    null
  );
  const [realtimeMeeting, setRealtimeMeeting] =
    useState<MeetingBannerData | null>(null);
  const [forceScrollToken, setForceScrollToken] = useState(0);
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    authorName: string;
    content: string;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    content: string;
    replyToId?: string;
  } | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  const messages = useMessageStore((state) => state.messages);
  const typingUsers = useMessageStore((state) => state.typingUsers);
  const onlineUsers = useMessageStore((state) => state.onlineUsers);
  const currentThreadId = useMessageStore((state) => state.currentThreadId);
  const setCurrentThreadId = useMessageStore(
    (state) => state.setCurrentThreadId
  );
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const removeMessage = useMessageStore((state) => state.removeMessage);
  const clearChannelState = useMessageStore((state) => state.clearChannelState);

  const joinRoom = useSocketStore((state) => state.joinRoom);
  const leaveRoom = useSocketStore((state) => state.leaveRoom);
  const emitMessage = useSocketStore((state) => state.emitMessage);
  const emitTyping = useSocketStore((state) => state.emitTyping);
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    applyDevAuthFromUrlOrFallback();
  }, []);

  const { data: myWorkspaces, isLoading: isLoadingWorkspaces } =
    useMyWorkspaces(1, 50);
  const workspaces = myWorkspaces?.data || [];

  const channelQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: ['chat-channel-directory', workspace._id],
      queryFn: () =>
        channelApi.getChannelDirectory(workspace.slug, { page: 1, limit: 200 }),
      enabled: !!workspace.slug,
      staleTime: 30000,
    })),
  });

  const activeChannel = useMemo(() => {
    for (const query of channelQueries) {
      const list: Channel[] = query.data?.data || [];
      const found = list.find(
        (channel) => channel._id === channelKey || channel.slug === channelKey
      );
      if (found) return found;
    }
    return null;
  }, [channelQueries, channelKey]);

  const resolvedChannelId =
    activeChannel?._id || (isLegacyObjectId ? channelKey : null);

  const isChannelMember = useMemo(() => {
    const userId = currentUser?.id;
    if (!userId || !activeChannel?.members) return false;
    return activeChannel.members.some((id) => String(id) === String(userId));
  }, [activeChannel, currentUser?.id]);

  const { data: channelDetailResponse, refetch: refetchChannelDetail } =
    useQuery({
      queryKey: ['channel-detail', resolvedChannelId],
      queryFn: () => channelApi.getChannel(resolvedChannelId as string),
      enabled: Boolean(resolvedChannelId && isChannelMember),
      staleTime: 30000,
    });

  const { data: channelMembersResponse, refetch: refetchChannelMembers } =
    useQuery({
      queryKey: ['channel-members', resolvedChannelId],
      queryFn: () =>
        channelApi.getChannelMembers(resolvedChannelId as string, 1, 300),
      enabled: Boolean(resolvedChannelId && isChannelMember),
      staleTime: 30000,
    });

  const {
    data: messageData,
    isLoading: isLoadingMessages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessages(
    isChannelMember && resolvedChannelId ? resolvedChannelId : '',
    50
  );

  useEffect(() => {
    if (!isChannelMember) {
      setMessages([]);
      return;
    }
    setMessages(messageData?.mergedMessages || []);
  }, [isChannelMember, messageData, setMessages]);

  useEffect(() => {
    if (!socket || !resolvedChannelId || !isConnected || !isChannelMember)
      return;
    void joinRoom(resolvedChannelId);

    return () => {
      void leaveRoom();
      clearChannelState();
    };
  }, [
    socket,
    resolvedChannelId,
    isConnected,
    isChannelMember,
    joinRoom,
    leaveRoom,
    clearChannelState,
  ]);

  const sendMutation = async (payload: {
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
    mentions?: string[];
  }) => {
    const temporaryId = `tmp-${Date.now()}`;

    addMessage({
      _id: temporaryId,
      workspaceId: activeChannel?.workspaceId || '',
      channelId: resolvedChannelId || '',
      userId: currentUser?.id || 'unknown',
      type: 'text',
      content: payload.content,
      threadCount: 0,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: payload.attachments || [],
      author: currentUser
        ? {
            _id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
          }
        : undefined,
    });

    const response = await emitMessage({
      channelId: resolvedChannelId || '',
      content: payload.content,
      attachments: payload.attachments,
      mentions: payload.mentions,
    });

    if (!response.success) {
      removeMessage(temporaryId);
      throw new Error(response.message || 'Failed to send message');
    }

    removeMessage(temporaryId);
  };

  const editMessage = useEditMessage(resolvedChannelId || '');
  const deleteMessage = useDeleteMessage(resolvedChannelId || '');
  const pinMessage = usePinMessage(resolvedChannelId || '');
  const unpinMessage = useUnpinMessage(resolvedChannelId || '');

  const members = useMemo<MemberProfile[]>(() => {
    const roleByUserId = new Map<string, 'owner' | 'admin' | 'member'>();
    (channelMembersResponse?.data || []).forEach((row: ChannelMemberRow) => {
      const rawUserId = row?.userId;
      const id = String(
        typeof rawUserId === 'string' ? rawUserId : rawUserId?._id || ''
      );
      const role = row?.role;
      if (id && (role === 'owner' || role === 'admin' || role === 'member')) {
        roleByUserId.set(id, role);
      }
    });

    const fromChannelDetail = (channelDetailResponse?.data?.members || [])
      .map(
        (member: {
          _id?: string;
          id?: string;
          name?: string;
          email?: string;
          avatar?: string;
        }) => ({
          id: String(member?._id || member?.id || ''),
          name: member?.name,
          email: member?.email,
          avatar: member?.avatar,
          role: roleByUserId.get(String(member?._id || member?.id || '')),
        })
      )
      .filter((member: MemberProfile) => Boolean(member.id));

    if (fromChannelDetail.length > 0) return fromChannelDetail;

    return (activeChannel?.members || []).map((id) => {
      const memberId = String(id);
      return {
        id: memberId,
        role: roleByUserId.get(memberId),
      };
    });
  }, [
    channelDetailResponse?.data?.members,
    activeChannel?.members,
    channelMembersResponse?.data,
  ]);

  const memberLookup = useMemo(() => {
    const map = new Map<string, MemberProfile>();

    members.forEach((member) => {
      map.set(member.id, member);
    });

    messages.forEach((message) => {
      const resolvedId = String(message.author?._id || message.userId || '');
      if (!resolvedId) return;

      const current = map.get(resolvedId) || { id: resolvedId };
      map.set(resolvedId, {
        ...current,
        name: message.author?.name || current.name,
        email: message.author?.email || current.email,
        avatar:
          message.author?.avatar || message.author?.avatarUrl || current.avatar,
      });
    });

    if (currentUser?.id) {
      const current = map.get(currentUser.id) || { id: currentUser.id };
      map.set(currentUser.id, {
        ...current,
        name: currentUser.name || current.name,
        email: currentUser.email || current.email,
        avatar: currentUser.avatar || current.avatar,
      });
    }

    return map;
  }, [members, messages, currentUser]);

  const typingNames = useMemo(() => {
    const ids = Object.keys(typingUsers).filter((id) => id !== currentUser?.id);
    return ids.map((id) => {
      const profile = memberLookup.get(id);
      return profile?.name || profile?.email || 'Unknown user';
    });
  }, [typingUsers, currentUser?.id, memberLookup]);

  const latestMeetingMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message?.type === 'meeting' && !message.isDeleted) {
        return message;
      }
    }
    return null;
  }, [messages]);

  const meetingFromMessage = useMemo<MeetingBannerData | null>(() => {
    if (!latestMeetingMessage) return null;

    const rawContent = (latestMeetingMessage.content || '').trim();
    if (!rawContent) return null;

    let parsed: MeetingContent | null = null;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = null;
    }

    const statusText = String(parsed?.status || rawContent).toLowerCase();
    const status: MeetingBannerData['status'] =
      statusText.includes('end') || statusText.includes('finish')
        ? 'ended'
        : statusText.includes('schedule')
          ? 'scheduled'
          : 'live';

    const participantsCount = Number(
      parsed?.participantsCount ||
        (Array.isArray(parsed?.participants) ? parsed.participants.length : 0)
    );

    return {
      key: latestMeetingMessage._id,
      title: String(parsed?.title || rawContent || 'Meeting update').replace(
        /^meeting\s*:\s*/i,
        ''
      ),
      status,
      participantsCount: Number.isFinite(participantsCount)
        ? participantsCount
        : 0,
    };
  }, [latestMeetingMessage]);

  useEffect(() => {
    if (!socket) return;

    const onMeetingStart = (payload: MeetingPayload) => {
      const expectedChannelId = String(resolvedChannelId || channelKey);
      if (
        !payload?.channelId ||
        String(payload.channelId) !== expectedChannelId
      )
        return;
      const participantsCount = Number(
        payload.participantsCount ||
          (Array.isArray(payload.participants)
            ? payload.participants.length
            : 0)
      );

      setRealtimeMeeting({
        key: String(payload.meetingId || payload.id || Date.now()),
        title: String(payload.title || 'Meeting in progress'),
        status: 'live',
        participantsCount: Number.isFinite(participantsCount)
          ? participantsCount
          : 0,
      });
    };

    const onMeetingEnd = (payload: MeetingPayload) => {
      const expectedChannelId = String(resolvedChannelId || channelKey);
      if (
        !payload?.channelId ||
        String(payload.channelId) !== expectedChannelId
      )
        return;
      setRealtimeMeeting({
        key: String(payload.meetingId || payload.id || Date.now()),
        title: String(payload.title || 'Meeting ended'),
        status: 'ended',
        participantsCount: 0,
      });
    };

    socket.on('meeting:start', onMeetingStart);
    socket.on('meeting:end', onMeetingEnd);

    return () => {
      socket.off('meeting:start', onMeetingStart);
      socket.off('meeting:end', onMeetingEnd);
    };
  }, [socket, resolvedChannelId, channelKey]);

  useEffect(() => {
    if (!socket || !resolvedChannelId) return;

    const onMemberAdded = (payload: { channelId?: string }) => {
      if (String(payload?.channelId || '') !== String(resolvedChannelId)) {
        return;
      }
      void refetchChannelMembers();
      void refetchChannelDetail();
    };

    const onMemberRemoved = (payload: {
      channelId?: string;
      user?: { id?: string };
    }) => {
      if (String(payload?.channelId || '') !== String(resolvedChannelId)) {
        return;
      }

      if (
        payload?.user?.id &&
        currentUser?.id &&
        payload.user.id === currentUser.id
      ) {
        toast('You have left this channel');
        router.replace('/channels');
        return;
      }

      void refetchChannelMembers();
      void refetchChannelDetail();
    };

    socket.on('channel:member:added', onMemberAdded);
    socket.on('channel:member:removed', onMemberRemoved);

    return () => {
      socket.off('channel:member:added', onMemberAdded);
      socket.off('channel:member:removed', onMemberRemoved);
    };
  }, [
    socket,
    resolvedChannelId,
    refetchChannelMembers,
    refetchChannelDetail,
    currentUser?.id,
    router,
  ]);

  const effectiveMeeting =
    realtimeMeeting && realtimeMeeting.status === 'live'
      ? realtimeMeeting
      : meetingFromMessage;

  const showMeetingBanner = Boolean(
    effectiveMeeting &&
    effectiveMeeting.status !== 'ended' &&
    dismissedMeetingKey !== effectiveMeeting.key
  );

  const threadMessage = useMemo(
    () => messages.find((message) => message._id === currentThreadId) || null,
    [messages, currentThreadId]
  );

  const currentMemberRole = currentUser
    ? members.find((m) => m.id === currentUser.id)?.role || null
    : null;

  const canInviteMembers =
    currentMemberRole === 'owner' || currentMemberRole === 'admin';

  const handleSendMessage = async (payload: {
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
    mentions?: string[];
  }) => {
    try {
      setForceScrollToken(Date.now());
      await sendMutation(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Cannot send message';
      toast.error(message);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage.mutateAsync({ messageId, content });
      setEditTarget(null);
    } catch {
      toast.error('Cannot edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch {
      toast.error('Cannot delete message');
    }
  };

  const handlePinToggle = async (messageId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await unpinMessage.mutateAsync(messageId);
      } else {
        await pinMessage.mutateAsync(messageId);
      }
    } catch {
      toast.error('Cannot update pin state');
    }
  };

  const handleInviteMembers = () => {
    setIsInviteDialogOpen(true);
  };

  const isResolvingChannelAccess =
    isLoadingWorkspaces || channelQueries.some((query) => query.isLoading);

  if (!isValidChannelSegment) {
    return (
      <main className="flex h-screen min-h-screen items-center justify-center bg-[#f8f9fb] p-6 text-[#191c1e]">
        <section className="w-full max-w-[20%] rounded-xl border border-[#e1e2e4] bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad6] text-[#93000a]">
              <span className="material-symbols-outlined">link_off</span>
            </div>
            <h1 className="text-lg font-semibold">Invalid channel link</h1>
          </div>
          <p className="mb-4 text-sm text-[#516070]">
            The channel URL is invalid or malformed.
          </p>
          <button
            type="button"
            onClick={() => router.replace('/channels')}
            className="rounded-lg cursor-pointer bg-[#004ac6] px-4 py-2 text-sm font-medium text-white hover:bg-[#003ea8]"
          >
            Back to Channel Directory
          </button>
        </section>
      </main>
    );
  }

  if (!isResolvingChannelAccess && !activeChannel) {
    return (
      <main className="flex h-screen min-h-screen items-center justify-center bg-[#f8f9fb] p-6 text-[#191c1e]">
        <section className="w-full max-w-[15%] rounded-xl border border-[#e1e2e4] bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad6] text-[#93000a]">
              <span className="material-symbols-outlined">error</span>
            </div>
            <h1 className="text-lg font-semibold">Channel not found</h1>
          </div>
          <p className="mb-4 text-sm text-[#516070]">
            This channel does not exist or you do not have access to it.
          </p>
          <button
            type="button"
            onClick={() => router.replace('/channels')}
            className="rounded-lg cursor-pointer bg-[#004ac6] px-4 py-2 text-sm font-medium text-white hover:bg-[#003ea8]"
          >
            Back to Channel Directory
          </button>
        </section>
      </main>
    );
  }

  if (!isResolvingChannelAccess && activeChannel && !isChannelMember) {
    return (
      <main className="flex h-screen min-h-screen items-center justify-center bg-[#f8f9fb] p-6 text-[#191c1e]">
        <section className="w-full max-w-[15%] rounded-xl border border-[#e1e2e4] bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad6] text-[#93000a]">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h1 className="text-lg font-semibold">Access restricted</h1>
          </div>
          <p className="mb-4 text-sm text-[#516070]">
            You are not a member of this channel. Join or request access from
            Channel Directory first.
          </p>
          <button
            type="button"
            onClick={() => router.push('/channels')}
            className="rounded-lg cursor-pointer bg-[#004ac6] px-4 py-2 text-sm font-medium text-white hover:bg-[#003ea8]"
          >
            Back to Channel Directory
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-screen min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff,#eef1f6_45%,#e8ecf5)] p-3 text-[#191c1e] md:p-4">
      <section className="flex min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#d7dce8] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
        <div className="flex min-w-0 flex-1 flex-col">
          <ChannelHeader
            channelName={activeChannel?.name || shortId(channelKey)}
            description={activeChannel?.description}
            memberCount={activeChannel?.memberCount || 0}
            isPrivate={activeChannel?.type === 'private'}
            isConnected={isConnected}
            memberAvatars={members.map((member) => ({
              id: member.id,
              name: member.name || member.email,
              avatar: member.avatar,
            }))}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />

          {showMeetingBanner && effectiveMeeting ? (
            <div className="mx-4 mt-3 rounded-xl bg-linear-to-r from-[#2f63d3] to-[#1f55c8] px-4 py-3 text-white shadow-sm md:mx-5 md:mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined rounded-full bg-white/20 p-2 text-[18px]">
                    podcasts
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {effectiveMeeting.status === 'scheduled'
                        ? `Meeting Scheduled: ${effectiveMeeting.title}`
                        : `Meeting in Progress: ${effectiveMeeting.title}`}
                    </p>
                    <p className="text-sm text-white/90">
                      {effectiveMeeting.participantsCount > 0
                        ? `${effectiveMeeting.participantsCount} participants are currently in the room.`
                        : 'Meeting updates are synced from channel activity.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/meetings')}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1d4fb6] hover:bg-[#f4f6fb]"
                  >
                    Open Meetings
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissedMeetingKey(effectiveMeeting.key)}
                    className="rounded-md p-1 text-white/90 hover:bg-white/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isResolvingChannelAccess ? (
            <div className="px-5 py-4 text-sm text-[#516070]">
              Loading channel info...
            </div>
          ) : null}

          <MessageList
            messages={messages}
            currentUserId={currentUser?.id}
            forceScrollToken={forceScrollToken}
            hasMore={Boolean(hasNextPage)}
            isFetchingMore={isFetchingNextPage}
            onLoadOlder={() => {
              void fetchNextPage();
            }}
            onReply={(messageId: string) => {
              setEditTarget(null);
              const target = messages.find((m) => m._id === messageId);
              if (!target) return;

              const authorName =
                target.author?.name || target.author?.email || 'Teammate';
              setReplyTarget({
                id: target._id,
                authorName,
                content: stripLeadingReplyMarkers(target.content),
              });
            }}
            onStartEdit={(payload: {
              messageId: string;
              content: string;
              replyToId?: string;
            }) => {
              setReplyTarget(null);
              setEditTarget({
                id: payload.messageId,
                content: payload.content,
                replyToId: payload.replyToId,
              });
            }}
            onDelete={handleDeleteMessage}
            onPinToggle={handlePinToggle}
            onOpenThread={(messageId: string) => {
              setReplyTarget(null);
              setEditTarget(null);
              setCurrentThreadId(messageId);
            }}
          />

          {isLoadingMessages ? (
            <div className="px-5 py-2 text-xs text-[#8a90a0]">
              Loading messages...
            </div>
          ) : null}

          <TypingIndicator names={typingNames} />

          <MessageComposer
            disabled={!isConnected || !isChannelMember}
            mentionUsers={members
              .filter(
                (member) => String(member.id) !== String(currentUser?.id || '')
              )
              .filter((member) => Boolean(member.id))
              .map((member) => ({
                id: String(member.id),
                name: member.name || member.email || 'Unknown user',
              }))}
            replyTo={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
            editTo={editTarget}
            onCancelEdit={() => setEditTarget(null)}
            onEditSubmit={handleEditMessage}
            onSend={handleSendMessage}
            onTyping={(isTyping: boolean) => {
              if (!resolvedChannelId) return;
              void emitTyping(resolvedChannelId, isTyping);
            }}
          />
        </div>

        <RightSidebar
          isOpen={isSidebarOpen}
          members={members.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            role: member.role,
          }))}
          messages={messages}
          onlineUsers={onlineUsers}
          currentUserId={currentUser?.id}
          onClose={() => setIsSidebarOpen(false)}
          canInvite={canInviteMembers}
          onInvite={handleInviteMembers}
        />
      </section>

      <ThreadPanel
        isOpen={Boolean(currentThreadId)}
        message={threadMessage as ChatMessage | null}
        currentUserId={currentUser?.id}
        onClose={() => setCurrentThreadId(null)}
      />

      <InviteMembersDialog
        isOpen={isInviteDialogOpen}
        channelId={resolvedChannelId}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </main>
  );
}
