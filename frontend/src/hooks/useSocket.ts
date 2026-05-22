import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import { useSocketStore } from '@/store/socketStore';
import { useMessageStore } from '@/store/messageStore';
import type { ChatMessage } from '@/types/message';

export const useSocket = (token: string | null) => {
  const setSocket = useSocketStore((state) => state.setSocket);
  const setConnected = useSocketStore((state) => state.setConnected);
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

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMessageNew = (message: ChatMessage) => addMessage(message);
    const onMessageUpdate = (message: ChatMessage) => {
      updateMessage(message._id, message);
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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:new', onMessageNew);
    socket.on('message:update', onMessageUpdate);
    socket.on('message:delete', onMessageDelete);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('presence:self', onPresenceSelf);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('channel:member:added', onMemberAdded);
    socket.on('channel:member:removed', onMemberRemoved);
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
      socket.off('message:new', onMessageNew);
      socket.off('message:update', onMessageUpdate);
      socket.off('message:delete', onMessageDelete);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('presence:self', onPresenceSelf);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('channel:member:added', onMemberAdded);
      socket.off('channel:member:removed', onMemberRemoved);
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
    setTypingUser,
    setOnlineUser,
  ]);

  return useSocketStore((state) => state.socket) as Socket | null;
};
