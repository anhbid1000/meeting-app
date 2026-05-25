import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/token";

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
    };
  };
}

export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  console.log('[socket] Auth middleware running');
  const token = socket.handshake.auth.token;

  if (!token) {
    console.error('[socket] Token missing');
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = verifyAccessToken(token) as { sub: string; email: string };
    console.log('[socket] Token verified, user:', decoded);
    socket.data.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    console.error('[socket] Token verification failed:', err);
    next(new Error("Authentication error: " + err));
  }
};
