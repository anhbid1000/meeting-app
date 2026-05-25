import { io, type Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

const getSocketUrl = () =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const getSocket = (token: string): Socket => {
  if (socketInstance) {
    const auth =
      socketInstance.auth && typeof socketInstance.auth === 'object'
        ? (socketInstance.auth as { token?: string })
        : {};

    if (auth.token !== token) {
      socketInstance.auth = { token };
    }
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    auth: { token },
  });

  socketInstance.connect();
  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
};
