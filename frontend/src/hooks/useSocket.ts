import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/services/socket';
import { useSocketStore } from '@/store/socketStore';
import { useMessageStore } from '@/store/messageStore';
import type { ChatMessage } from '@/types/message';

export const useSocket = (token: string | null) => {
  const setSocket = useSocketStore((state) => state.setSocket);
  const setConnected = useSocketStore((state) => state.setConnected);
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const removeMessage = useMessageStore((state) => state.removeMessage);
  const setTypingUser = useMessageStore((state) => state.setTypingUser);
  const setOnlineUser = useMessageStore((state) => state.setOnlineUser);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const socket = getSocket(token);
    setSocket(socket);

    const onConnect = () => {
      console.log('[socket] Connected');
      setConnected(true);
    };
    const onDisconnect = () => {
      console.log('[socket] Disconnected');
      setConnected(false);
    };
    const onConnectError = (error: Error) => {
      console.error('[socket] Connection error:', error.message);
      setConnected(false);
    };

    const onMessageNew = (message: ChatMessage) => addMessage(message);
    const onMessageUpdate = (message: ChatMessage) => {
      updateMessage(message._id, message);
    };
    const normalizeMessage = (message: ChatMessage): ChatMessage => ({
      ...message,
      _id: String(message._id),
      channelId: String(message.channelId),
      workspaceId: String(message.workspaceId),
      userId: String(message.userId),
    });
    const invalidatePinnedMessages = (message?: ChatMessage) => {
      if (!message?.channelId) return;
      queryClient.invalidateQueries({
        queryKey: ['pinned-messages', String(message.channelId)],
      });
    };
    const onMessagePin = (message: ChatMessage) => {
      const normalized = normalizeMessage(message);
      updateMessage(normalized._id, normalized);
      invalidatePinnedMessages(normalized);
    };
    const onMessageUnpin = (message: ChatMessage) => {
      const normalized = normalizeMessage(message);
      updateMessage(normalized._id, normalized);
      invalidatePinnedMessages(normalized);
    };
    const onMessageDelete = (payload: { messageId?: string; _id?: string }) => {
      const id = payload?.messageId || payload?._id;
      if (id) {
        removeMessage(id);
      }
    };

    const onTypingStart = (payload: { userId: string }) => {
      if (payload?.userId) setTypingUser(payload.userId, true);
    };
    const onTypingStop = (payload: { userId: string }) => {
      if (payload?.userId) setTypingUser(payload.userId, false);
    };

    const onPresenceSelf = (payload: { onlineUsers?: string[] }) => {
      (payload?.onlineUsers || []).forEach((userId) =>
        setOnlineUser(userId, true)
      );
    };

    const onPresenceUpdate = (payload: {
      userId: string;
      status: 'online' | 'offline';
    }) => {
      if (!payload?.userId) return;
      setOnlineUser(payload.userId, payload.status === 'online');
    };

    const onSocketError = (payload: { message?: string }) => {
      if (payload?.message) {
        if (
          payload.message.includes(
            'you must be a channel member to join realtime room'
          )
        ) {
          return;
        }
        console.error('Socket error:', payload.message);
      }
    };

    const emitActivity = () => {
      if (!socket.connected) return;
      socket.emit('presence:activity');
    };

    let activityThrottle = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - activityThrottle < 20000) return;
      activityThrottle = now;
      emitActivity();
    };

    const onMemberAdded = (payload: { user?: { id?: string } }) => {
      const userId = payload?.user?.id;
      if (userId) setOnlineUser(userId, true);
    };

    const onMemberRemoved = (payload: { user?: { id?: string } }) => {
      const userId = payload?.user?.id;
      if (userId) {
        setTypingUser(userId, false);
        setOnlineUser(userId, false);
      }
    };

    const onThreadReplyNew = (payload: {
      parentMessageId?: string;
      threadCount?: number;
    }) => {
      if (!payload?.parentMessageId) return;
      if (typeof payload.threadCount === 'number') {
        updateMessage(payload.parentMessageId, {
          threadCount: payload.threadCount,
        });
      }
    };

    const onThreadReplyDelete = (payload: {
      parentMessageId?: string;
      threadCount?: number;
    }) => {
      if (!payload?.parentMessageId) return;
      if (typeof payload.threadCount === 'number') {
        updateMessage(payload.parentMessageId, {
          threadCount: payload.threadCount,
        });
      }
    };

    const onReactionChanged = (payload: {
      messageId?: string;
      reactions?: ChatMessage['reactions'];
    }) => {
      if (!payload?.messageId) return;
      updateMessage(payload.messageId, {
        reactions: payload.reactions || [],
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('message:new', onMessageNew);
    socket.on('message:update', onMessageUpdate);
    socket.on('message:pin', onMessagePin);
    socket.on('message:unpin', onMessageUnpin);
    socket.on('message:delete', onMessageDelete);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('presence:self', onPresenceSelf);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('channel:member:added', onMemberAdded);
    socket.on('channel:member:removed', onMemberRemoved);
    socket.on('thread:reply:new', onThreadReplyNew);
    socket.on('thread:reply:delete', onThreadReplyDelete);
    socket.on('reaction:add', onReactionChanged);
    socket.on('reaction:remove', onReactionChanged);
    socket.on('socket:error', onSocketError);

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    document.addEventListener('visibilitychange', onActivity);

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        emitActivity();
      }
    }, 60000);

    if (socket.connected) {
      onConnect();
      emitActivity();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('message:new', onMessageNew);
      socket.off('message:update', onMessageUpdate);
      socket.off('message:pin', onMessagePin);
      socket.off('message:unpin', onMessageUnpin);
      socket.off('message:delete', onMessageDelete);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('presence:self', onPresenceSelf);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('channel:member:added', onMemberAdded);
      socket.off('channel:member:removed', onMemberRemoved);
      socket.off('thread:reply:new', onThreadReplyNew);
      socket.off('thread:reply:delete', onThreadReplyDelete);
      socket.off('reaction:add', onReactionChanged);
      socket.off('reaction:remove', onReactionChanged);
      socket.off('socket:error', onSocketError);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('scroll', onActivity);
      document.removeEventListener('visibilitychange', onActivity);
      window.clearInterval(heartbeat);
    };
  }, [
    token,
    setSocket,
    setConnected,
    addMessage,
    updateMessage,
    removeMessage,
    queryClient,
    setTypingUser,
    setOnlineUser,
  ]);

  return useSocketStore((state) => state.socket) as Socket | null;
};
