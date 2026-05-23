import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import threadReplyApi from '@/services/threadReplyApi';
import type { ThreadReply } from '@/types/message';

export const useThreadReplies = (messageId: string, enabled = true) => {
  return useQuery({
    queryKey: ['thread-replies', messageId],
    enabled: Boolean(messageId) && enabled,
    queryFn: () => threadReplyApi.getReplies(messageId, 1, 200),
    staleTime: 10000,
  });
};

export const useCreateThreadReply = (messageId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { content: string }) =>
      threadReplyApi.createReply(messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['thread-replies', messageId],
      });
    },
  });
};

export const useEditThreadReply = (messageId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, content }: { replyId: string; content: string }) =>
      threadReplyApi.editReply(replyId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['thread-replies', messageId],
      });
    },
  });
};

export const useDeleteThreadReply = (messageId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => threadReplyApi.deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['thread-replies', messageId],
      });
    },
  });
};

export const useSortedThreadReplies = (replies: ThreadReply[] | undefined) => {
  return useMemo(() => {
    return [...(replies || [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [replies]);
};
