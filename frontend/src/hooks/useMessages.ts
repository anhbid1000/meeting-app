import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import messageApi from '@/services/messageApi';
import type { ChatMessage, MessageListResponse } from '@/types/message';

export const useMessages = (channelId: string, limit = 50) => {
  return useInfiniteQuery({
    queryKey: ['messages', channelId, limit],
    enabled: !!channelId,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      return messageApi.getMessages(channelId, {
        limit,
        before: pageParam || undefined,
      });
    },
    getNextPageParam: (lastPage: MessageListResponse) => {
      if (!lastPage?.meta?.hasMore) return undefined;
      return lastPage.meta.nextBefore || undefined;
    },
    select: (data) => {
      const allMessages = data.pages.flatMap((page) => page.data || []);
      const uniqueMap = new Map<string, ChatMessage>();
      allMessages.forEach((message) => {
        uniqueMap.set(message._id, message);
      });

      const ordered = Array.from(uniqueMap.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return {
        ...data,
        mergedMessages: ordered,
      };
    },
  });
};

export const useSendMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      content: string;
      attachments?: Array<{
        url: string;
        name: string;
        mimeType: string;
        size: number;
      }>;
      mentions?: string[];
      type?: 'text' | 'file' | 'system' | 'meeting';
    }) => messageApi.sendMessage(channelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const useEditMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => messageApi.editMessage(messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const useDeleteMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const usePinMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageApi.pinMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const useUnpinMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageApi.unpinMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const useAddReaction = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageApi.addReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};

export const useRemoveReaction = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageApi.removeReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });
};
