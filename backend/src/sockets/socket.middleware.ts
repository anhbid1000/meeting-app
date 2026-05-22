import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

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
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error(
        "JWT_SECRET is not set - socket authentication cannot proceed",
      );
      return next(new Error("Server misconfiguration: JWT_SECRET not set"));
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};
