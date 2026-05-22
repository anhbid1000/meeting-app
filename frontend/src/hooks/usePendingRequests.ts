import { useQuery } from '@tanstack/react-query';
import { channelApi } from '@/services/channelApi';

/**
 * Hook to fetch user's pending join requests across all channels
 */
export const useMyPendingRequests = () => {
  return useQuery({
    queryKey: ['myPendingRequests'],
    queryFn: async () => {
      const response = await channelApi.getMyPendingRequests();
      return response;
    },
    staleTime: 30000,
  });
};

/**
 * Hook to fetch latest sent join request statuses per channel for current user
 */
export const useMyJoinRequests = () => {
  return useQuery({
    queryKey: ['myJoinRequests'],
    queryFn: async () => {
      const response = await channelApi.getMyRequests();
      return response;
    },
    staleTime: 30000,
  });
};
