import jwt from 'jsonwebtoken';
import { socketAuthMiddleware } from '../sockets/socket.middleware';
import { setupSocketHandlers } from '../sockets';
import { MessageService } from '../services/Message.service';

describe('Phase 5 smoke', () => {
  it('socket middleware/auth and setup are defined', () => {
    expect(typeof socketAuthMiddleware).toBe('function');
    expect(typeof setupSocketHandlers).toBe('function');
  });

  it('socket auth middleware rejects missing token', (done) => {
    const socket: any = { handshake: { auth: {} }, data: {} };

    socketAuthMiddleware(socket, (err?: Error) => {
      expect(err).toBeDefined();
      expect(err?.message).toContain('Token missing');
      done();
    });
  });

  it('socket auth middleware accepts valid token and attaches user', (done) => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: 'u1', email: 'u1@test.com' }, process.env.JWT_SECRET);
    const socket: any = { handshake: { auth: { token } }, data: {} };

    socketAuthMiddleware(socket, (err?: Error) => {
      expect(err).toBeUndefined();
      expect(socket.data.user).toBeDefined();
      expect(socket.data.user.id).toBe('u1');
      done();
    });
  });

  it('message service methods remain available for socket bridge', () => {
    expect(typeof MessageService.sendMessage).toBe('function');
    expect(typeof MessageService.editMessage).toBe('function');
    expect(typeof MessageService.deleteMessage).toBe('function');
  });
});
