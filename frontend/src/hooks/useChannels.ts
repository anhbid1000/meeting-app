import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelApi } from '@/services/channelApi';
import { useChannelStore } from '@/store/channelStore';
import { ChannelDirectoryQuery } from '@/types/channel';
import toast from 'react-hot-toast';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response!
      .data!.message as string;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

/**
 * Hook to fetch channel directory
 */
export const useChannelDirectory = (
  workspaceId: string,
  query?: ChannelDirectoryQuery
) => {
  const setChannels = useChannelStore((state) => state.setChannels);
  const setMeta = useChannelStore((state) => state.setMeta);
  const setLoading = useChannelStore((state) => state.setLoading);
  const setError = useChannelStore((state) => state.setError);

  return useQuery({
    queryKey: ['channels', workspaceId, query],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await channelApi.getChannelDirectory(
          workspaceId,
          query
        );
        const channels = response.data ?? [];
        const meta = response.meta ?? { total: channels.length, totalPages: 1 };
        setChannels(channels);
        setMeta({
          total: meta.total,
          totalPages: meta.totalPages,
        });
        return { channels, meta };
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error, 'Failed to fetch channels');
        setError(errorMsg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!workspaceId,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single channel
 */
export const useChannel = (channelId: string) => {
  const setCurrentChannel = useChannelStore((state) => state.setCurrentChannel);

  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const response = await channelApi.getChannel(channelId);
      setCurrentChannel(response.data);
      return response.data;
    },
    enabled: !!channelId,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch pending requests for a channel
 */
export const usePendingRequests = (channelId: string, page = 1, limit = 20) => {
  const setPendingRequests = useChannelStore(
    (state) => state.setPendingRequests
  );

  return useQuery({
    queryKey: ['pendingRequests', channelId, page, limit],
    queryFn: async () => {
      const response = await channelApi.getPendingRequests(
        channelId,
        page,
        limit
      );
      setPendingRequests(response.items);
      return response;
    },
    enabled: !!channelId,
    staleTime: 10000,
  });
};

/**
 * Mutation to create a channel
 */
export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const addChannel = useChannelStore((state) => state.addChannel);

  return useMutation({
    mutationFn: async ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: {
        name: string;
        description?: string;
        type: 'public' | 'private';
        category?: string;
      };
    }) => {
      return channelApi.createChannel(workspaceId, data);
    },
    onSuccess: (response, variables) => {
      addChannel(response.data);
      queryClient.invalidateQueries({
        queryKey: ['channels', variables.workspaceId],
      });
      toast.success(response.message || 'Channel created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create channel'));
    },
  });
};

/**
 * Mutation to update a channel
 */
export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  const updateChannel = useChannelStore((state) => state.updateChannel);

  return useMutation({
    mutationFn: async ({
      channelId,
      data,
    }: {
      channelId: string;
      data: {
        name?: string;
        description?: string;
        type?: 'public' | 'private';
        category?: string;
        isArchived?: boolean;
      };
    }) => {
      return channelApi.updateChannel(channelId, data);
    },
    onSuccess: (response, variables) => {
      updateChannel(variables.channelId, response.data);
      queryClient.invalidateQueries({
        queryKey: ['channel', variables.channelId],
      });
      toast.success('Channel updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update channel'));
    },
  });
};

/**
 * Mutation to delete a channel
 */
export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  const removeChannel = useChannelStore((state) => state.removeChannel);

  return useMutation({
    mutationFn: async (channelId: string) => {
      return channelApi.deleteChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      removeChannel(channelId);
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete channel'));
    },
  });
};

/**
 * Mutation to join a channel
 */
export const useJoinChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      return channelApi.joinChannel(channelId);
    },
    onSuccess: (response, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success(response.message || 'Joined channel successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to join channel'));
    },
  });
};

/**
 * Mutation to leave a channel
 */
export const useLeaveChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      return channelApi.leaveChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Left channel successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to leave channel'));
    },
  });
};

/**
 * Mutation to request access to a private channel
 */
export const useRequestAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      message,
    }: {
      channelId: string;
      message?: string;
    }) => {
      return channelApi.requestAccess(channelId, message);
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['myJoinRequests'], (oldData: any) => {
        const existing = Array.isArray(oldData?.data) ? oldData.data : [];
        const withoutCurrentChannel = existing.filter((item: any) => {
          const channelId =
            typeof item?.channelId === 'string'
              ? item.channelId
              : item?.channelId?._id;
          return channelId !== variables.channelId;
        });

        return {
          ...(oldData || {}),
          success: true,
          data: [
            {
              channelId: variables.channelId,
              status: 'pending',
              type: 'request',
              updatedAt: new Date().toISOString(),
            },
            ...withoutCurrentChannel,
          ],
        };
      });

      queryClient.invalidateQueries({ queryKey: ['myJoinRequests'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success(response.message || 'Access request sent');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to send request'));
    },
  });
};

/**
 * Mutation to approve a join request
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  const removePendingRequest = useChannelStore(
    (state) => state.removePendingRequest
  );

  return useMutation({
    mutationFn: async ({
      channelId,
      requestId,
    }: {
      channelId: string;
      requestId: string;
    }) => {
      return channelApi.approveRequest(channelId, requestId);
    },
    onSuccess: (response, variables) => {
      removePendingRequest(variables.requestId);
      queryClient.invalidateQueries({
        queryKey: ['pendingRequests', variables.channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ['channel', variables.channelId],
      });
      toast.success(response.message || 'Request approved');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to approve request'));
    },
  });
};

/**
 * Mutation to reject a join request
 */
export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  const removePendingRequest = useChannelStore(
    (state) => state.removePendingRequest
  );

  return useMutation({
    mutationFn: async ({
      channelId,
      requestId,
      reason,
    }: {
      channelId: string;
      requestId: string;
      reason?: string;
    }) => {
      return channelApi.rejectRequest(channelId, requestId, reason);
    },
    onSuccess: (response, variables) => {
      removePendingRequest(variables.requestId);
      queryClient.invalidateQueries({
        queryKey: ['pendingRequests', variables.channelId],
      });
      toast.success(response.message || 'Request rejected');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to reject request'));
    },
  });
};

/**
 * Mutation to toggle favorite status for current user on a channel
 */
export const useFavoriteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      isFavorite,
    }: {
      channelId: string;
      isFavorite: boolean;
    }) => {
      return channelApi.favoriteChannel(channelId, isFavorite);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({
        queryKey: ['channel', variables.channelId],
      });
      toast.success(
        variables.isFavorite
          ? 'Channel added to favorites'
          : 'Channel removed from favorites'
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update favorite status'));
    },
  });
};
