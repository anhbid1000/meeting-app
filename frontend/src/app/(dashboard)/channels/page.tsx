'use client';

import { useMemo, useState, useEffect } from 'react';
import * as React from 'react';
import { startTransition } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ChannelSearchBar from '@/components/channels/ChannelSearchBar';
import ChannelFilterTabs from '@/components/channels/ChannelFilterTabs';
import ChannelGroupSection from '@/components/channels/ChannelGroupSection';
import ChannelCardSkeleton from '@/components/channels/ChannelCardSkeleton';
import ChannelEmptyState from '@/components/channels/ChannelEmptyState';
import RequestAccessDialog from '@/components/channels/RequestAccessDialog';
import { channelApi } from '@/services/channelApi';
import { useMyWorkspaces } from '@/hooks/useWorkspaces';
import { useMyJoinRequests } from '@/hooks/usePendingRequests';
import {
  useDeleteChannel,
  useFavoriteChannel,
  useJoinChannel,
  useLeaveChannel,
} from '@/hooks/useChannels';
import { useChannelStore } from '@/store/channelStore';
import { useAuthStore } from '@/store/authStore';
import type { Channel } from '@/types/channel';

export default function ChannelDirectoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [requestChannelId, setRequestChannelId] = useState<string | null>(null);
  const [joinedChannelIds, setJoinedChannelIds] = useState<string[]>([]);
  const [didInitJoinedIds, setDidInitJoinedIds] = useState(false);
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const [memberCountOverrides, setMemberCountOverrides] = useState<
    Record<string, number>
  >({});

  const { filters, setFilters } = useChannelStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const devToken = process.env.NEXT_PUBLIC_DEV_TOKEN;
      const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
      const devUserEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL;
      const devUserName = process.env.NEXT_PUBLIC_DEV_USER_NAME;

      if (devToken && devUserId && devUserEmail) {
        const realUser = {
          id: devUserId,
          email: devUserEmail,
          name: devUserName || devUserEmail,
        };

        useAuthStore.getState().setDevUser(realUser);
        if (typeof window !== 'undefined')
          localStorage.setItem('accessToken', devToken);
      }
    }
  }, []);

  const {
    data: myWorkspaces,
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
  } = useMyWorkspaces(1, 50);

  const { data: myJoinRequestsData } = useMyJoinRequests();
  const requestStatusByChannelId = useMemo(() => {
    const requests = myJoinRequestsData?.data ?? [];
    return requests.reduce(
      (
        acc: Record<
          string,
          'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked'
        >,
        req: {
          channelId: string | { _id?: string };
          status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
        }
      ) => {
        const channelId =
          typeof req.channelId === 'string'
            ? req.channelId
            : req.channelId?._id || '';
        if (channelId) {
          acc[channelId] = req.status;
        }
        return acc;
      },
      {}
    );
  }, [myJoinRequestsData]);

  const workspaces = myWorkspaces?.data ?? [];

  const channelQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: [
        'channels-by-workspace',
        workspace._id,
        filters.search,
        filters.type,
        filters.category,
        filters.page,
        filters.limit,
        filters.sort,
      ],
      queryFn: () =>
        channelApi.getChannelDirectory(workspace.slug, {
          search: filters.search,
          type: filters.type,
          category: filters.category,
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        }),
      enabled: !!workspace.slug,
      staleTime: 30000,
    })),
  });

  const isLoading =
    isWorkspacesLoading || channelQueries.some((q) => q.isLoading);
  const isError = isWorkspacesError || channelQueries.some((q) => q.isError);

  const joinChannel = useJoinChannel();
  const leaveChannel = useLeaveChannel();
  const deleteChannel = useDeleteChannel();
  const favoriteChannel = useFavoriteChannel();

  const channels = useMemo(() => {
    type EnrichedChannel = Channel & {
      unreadCount?: number;
      isFavorite?: boolean;
      activeNow?: number;
      lastMessagePreview?: string;
      lastActivityActor?: string;
      workspaceName?: string;
      workspaceSlug?: string;
      canManageChannel?: boolean;
    };

    const merged: EnrichedChannel[] = [];
    let index = 0;

    workspaces.forEach((workspace, workspaceIndex) => {
      const response = channelQueries[workspaceIndex]?.data;
      const source: Channel[] = response?.data ?? [];

      source.forEach(
        (
          channel: Channel & {
            lastMessagePreview?: string;
            lastMessageText?: string;
            lastMessageSenderName?: string;
          }
        ) => {
          const isWorkspaceOwner =
            workspace.ownerId === useAuthStore.getState().user?.id;
          const canManageChannel =
            isWorkspaceOwner ||
            channel.createdBy === useAuthStore.getState().user?.id;

          const lastMessagePreview =
            channel.lastMessagePreview ||
            channel.lastMessageText ||
            (channel.lastMessageAt
              ? `Recent updates in #${channel.name}`
              : undefined);

          const effectiveMemberCount =
            memberCountOverrides[channel._id] ?? channel.memberCount ?? 0;

          merged.push({
            ...channel,
            workspaceName: workspace.name,
            workspaceSlug: workspace.slug,
            unreadCount: 0,
            isFavorite: favoriteOverrides[channel._id] ?? false,
            memberCount: effectiveMemberCount,
            activeNow: Math.max(0, effectiveMemberCount % 8),
            lastMessagePreview,
            lastActivityActor: channel.lastMessageSenderName,
            canManageChannel,
          });
          index += 1;
        }
      );
    });

    return merged;
  }, [workspaces, channelQueries, favoriteOverrides, memberCountOverrides]);

  useEffect(() => {
    if (didInitJoinedIds || !channels.length) return;
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const initialJoinedIds = channels
      .filter(
        (ch) =>
          Array.isArray(ch.members) &&
          ch.members.some((m) => String(m) === String(userId))
      )
      .map((ch) => ch._id);

    // Use startTransition to avoid blocking render
    if (typeof window !== 'undefined') {
      startTransition(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJoinedChannelIds(initialJoinedIds);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDidInitJoinedIds(true);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJoinedChannelIds(initialJoinedIds);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDidInitJoinedIds(true);
    }
  }, [channels, didInitJoinedIds]);

  const visibleChannels = useMemo(() => {
    type EnrichedChannel = (typeof channels)[0];

    const baseChannels =
      filters.status === 'archived'
        ? channels.filter((ch: EnrichedChannel) => ch.isArchived)
        : channels.filter((ch: EnrichedChannel) => !ch.isArchived);

    if (filters.status === 'joined') {
      return baseChannels.filter((ch: EnrichedChannel) =>
        joinedChannelIds.includes(ch._id)
      );
    }
    if (filters.status === 'unread') {
      return baseChannels.filter(
        (ch: EnrichedChannel) => (ch.unreadCount ?? 0) > 0
      );
    }
    if (filters.status === 'favorites') {
      return baseChannels.filter((ch: EnrichedChannel) => ch.isFavorite);
    }

    return baseChannels;
  }, [channels, filters.status, joinedChannelIds]);

  const groupedChannels = useMemo(() => {
    type EnrichedChannel = (typeof channels)[0];
    return visibleChannels.reduce<Record<string, EnrichedChannel[]>>(
      (acc, channel: EnrichedChannel) => {
        const group =
          channel.workspaceName || channel.workspaceId || 'Unknown Workspace';
        if (!acc[group]) acc[group] = [];
        acc[group].push(channel);
        return acc;
      },
      {}
    );
  }, [visibleChannels, channels]);

  const handleSearch = (search: string) => setFilters({ search, page: 1 });

  const handleFilterTab = (tab: {
    id: string;
    type?: 'public' | 'private';
    status?: 'all' | 'joined' | 'unread' | 'favorites' | 'archived';
  }) => {
    setActiveTab(tab.id);
    setFilters({ type: tab.type, status: tab.status, page: 1 });
  };

  const handleJoin = async (channelId: string) => {
    try {
      const target = channels.find((ch) => ch._id === channelId);
      const alreadyJoined = joinedChannelIds.includes(channelId);

      await joinChannel.mutateAsync(channelId);
      setJoinedChannelIds((prev) =>
        prev.includes(channelId) ? prev : [...prev, channelId]
      );

      if (!alreadyJoined && target) {
        const currentCount =
          memberCountOverrides[channelId] ?? target.memberCount ?? 0;
        setMemberCountOverrides((prev) => ({
          ...prev,
          [channelId]: currentCount + 1,
        }));
      }
    } catch {
      // Mutation already shows toast; suppress unhandled promise rejection in click handler.
    }
  };

  const handleLeave = async (channelId: string) => {
    try {
      const target = channels.find((ch) => ch._id === channelId);
      const wasJoined = joinedChannelIds.includes(channelId);

      await leaveChannel.mutateAsync(channelId);
      setJoinedChannelIds((prev) => prev.filter((id) => id !== channelId));

      if (wasJoined && target) {
        const currentCount =
          memberCountOverrides[channelId] ?? target.memberCount ?? 0;
        setMemberCountOverrides((prev) => ({
          ...prev,
          [channelId]: Math.max(0, currentCount - 1),
        }));
      }
    } catch {
      // Mutation already shows toast; suppress unhandled promise rejection in click handler.
    }
  };

  const handleToggleFavorite = async (
    channelId: string,
    isFavorite: boolean
  ) => {
    try {
      await favoriteChannel.mutateAsync({ channelId, isFavorite });
      setFavoriteOverrides((prev) => ({ ...prev, [channelId]: isFavorite }));
    } catch {
      // Mutation already shows toast; suppress unhandled promise rejection in click handler.
    }
  };

  const handleCopyLink = async (channelId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/channels/${channelId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Channel link copied');
  };

  const handleViewInfo = (channelId: string) => {
    router.push(`/channels/${channelId}`);
  };

  const handleDelete = async (channelId: string) => {
    const confirmed =
      typeof window !== 'undefined' &&
      window.confirm('Delete this channel permanently?');
    if (!confirmed) return;

    try {
      await deleteChannel.mutateAsync(channelId);
      setJoinedChannelIds((prev) => prev.filter((id) => id !== channelId));
      setFavoriteOverrides((prev) => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
      setMemberCountOverrides((prev) => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
    } catch {
      // Mutation already shows toast; suppress unhandled promise rejection in click handler.
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8f9fb] text-[#191c1e]">
      <header className="flex items-center px-6 w-full h-16 sticky top-0 z-40 bg-white border-b border-[#e1e2e4] shadow-sm">
        <div className="relative w-full max-w-2xl">
          <ChannelSearchBar
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Search channels..."
          />
        </div>
      </header>

      <section className="p-6 bg-[#f8f9fb] border-b border-[#e1e2e4]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#191c1e]">
              Channel Directory
            </h2>
            <p className="text-sm text-[#516070]">
              Discover and join communication spaces across your workspaces.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type || 'all'}
              onChange={(e) =>
                setFilters({
                  type:
                    e.target.value === 'all'
                      ? undefined
                      : (e.target.value as 'public' | 'private'),
                  page: 1,
                })
              }
              className="bg-white border border-[#c3c6d7] rounded-lg text-sm px-4 py-2 outline-none focus:border-[#004ac6]"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select
              value={filters.sort || 'activity'}
              onChange={(e) =>
                setFilters({
                  sort: e.target.value as 'activity' | 'name' | 'memberCount',
                  page: 1,
                })
              }
              className="bg-white border border-[#c3c6d7] rounded-lg text-sm px-4 py-2 outline-none focus:border-[#004ac6]"
            >
              <option value="activity">Sort: Most Active</option>
              <option value="name">Sort: Alphabetical</option>
              <option value="memberCount">Sort: Member Count</option>
            </select>
          </div>
        </div>

        <ChannelFilterTabs
          activeTab={activeTab}
          onTabChange={handleFilterTab}
        />
      </section>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ChannelCardSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-4">
            Failed to load channels. Please check the backend connection and try
            again.
          </div>
        )}

        {!isLoading && !isError && visibleChannels.length === 0 && (
          <ChannelEmptyState />
        )}

        {!isLoading &&
          !isError &&
          Object.entries(groupedChannels).map(([groupTitle, groupChannels]) => (
            <ChannelGroupSection
              key={groupTitle}
              groupTitle={groupTitle}
              channels={groupChannels}
              joinedChannelIds={joinedChannelIds}
              requestStatusByChannelId={requestStatusByChannelId}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onRequestAccess={setRequestChannelId}
              onToggleFavorite={handleToggleFavorite}
              onCopyLink={handleCopyLink}
              onViewInfo={handleViewInfo}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {requestChannelId && (
        <RequestAccessDialog
          channelId={requestChannelId}
          isOpen={!!requestChannelId}
          onClose={() => setRequestChannelId(null)}
        />
      )}
    </main>
  );
}
