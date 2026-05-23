import {
  registerMessageBusHandlers,
  handleMessageSocket,
} from "../sockets/messageSocket";
import { realtimeBus } from "../utils/realtime";
import { MessageService } from "../services/Message.service";

jest.mock("../services/Message.service", () => ({
  MessageService: {
    sendMessage: jest.fn(),
    editMessage: jest.fn(),
    deleteMessage: jest.fn(),
  },
}));

describe("Phase 7 - Message Socket Events", () => {
  it("registerMessageBusHandlers should forward message:new to channel room", () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const io: any = { to };

    registerMessageBusHandlers(io);

    realtimeBus.emitEvent("message:new", {
      _id: "m1",
      channelId: "c1",
      content: "hello",
    });

    expect(to).toHaveBeenCalledWith("channel:c1");
    expect(emit).toHaveBeenCalledWith(
      "message:new",
      expect.objectContaining({ _id: "m1" }),
    );
  });

  it("message:new socket handler validates required payload", async () => {
    const socketHandlers: Record<string, Function> = {};
    const socket: any = {
      data: { user: { id: "u1" } },
      on: jest.fn((event: string, handler: Function) => {
        socketHandlers[event] = handler;
      }),
      emit: jest.fn(),
    };

    handleMessageSocket({} as any, socket);

    const ack = jest.fn();
    await socketHandlers["message:new"]({ content: "x" }, ack);

    expect(ack).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(socket.emit).toHaveBeenCalledWith(
      "socket:error",
      expect.objectContaining({ event: "message:new" }),
    );
  });

  it("message:update socket handler validates messageId and content", async () => {
    const socketHandlers: Record<string, Function> = {};
    const socket: any = {
      data: { user: { id: "u1" } },
      on: jest.fn((event: string, handler: Function) => {
        socketHandlers[event] = handler;
      }),
      emit: jest.fn(),
    };

    handleMessageSocket({} as any, socket);

    const ack = jest.fn();
    await socketHandlers["message:update"](
      { messageId: "m1", content: "   " },
      ack,
    );

    expect(ack).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(socket.emit).toHaveBeenCalledWith(
      "socket:error",
      expect.objectContaining({ event: "message:update" }),
    );
  });

  it("message:delete socket handler validates messageId", async () => {
    const socketHandlers: Record<string, Function> = {};
    const socket: any = {
      data: { user: { id: "u1" } },
      on: jest.fn((event: string, handler: Function) => {
        socketHandlers[event] = handler;
      }),
      emit: jest.fn(),
    };

    handleMessageSocket({} as any, socket);

    const ack = jest.fn();
    await socketHandlers["message:delete"]({}, ack);

    expect(ack).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(socket.emit).toHaveBeenCalledWith(
      "socket:error",
      expect.objectContaining({ event: "message:delete" }),
    );
  });

  it("message:new socket handler should call service and ack success", async () => {
    (MessageService.sendMessage as jest.Mock).mockResolvedValueOnce({
      _id: "m2",
      channelId: "c2",
      content: "ok",
    });

    const socketHandlers: Record<string, Function> = {};
    const socket: any = {
      data: { user: { id: "u1" } },
      on: jest.fn((event: string, handler: Function) => {
        socketHandlers[event] = handler;
      }),
      emit: jest.fn(),
    };

    handleMessageSocket({} as any, socket);

    const ack = jest.fn();
    await socketHandlers["message:new"](
      { channelId: "c2", content: "ok" },
      ack,
    );

    expect(MessageService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: "c2", content: "ok", userId: "u1" }),
    );
    expect(ack).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
