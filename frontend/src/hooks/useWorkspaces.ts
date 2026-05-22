import { useQuery } from '@tanstack/react-query';
import workspaceApi from '@/services/workspaceApi';

export const useMyWorkspaces = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['myWorkspaces', page, limit],
    queryFn: () => workspaceApi.getMyWorkspaces(page, limit),
    staleTime: 60000,
  });
};
