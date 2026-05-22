import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { createTestApp, closeTestApp } from "./app";
import Workspace from "../models/Workspace.model";
import Channel from "../models/Channel.model";
import ChannelMember from "../models/ChannelMember.model";
import Message from "../models/Message.model";

let app: any;
let mongod: MongoMemoryServer;

const userA = new Types.ObjectId();
const userB = new Types.ObjectId();
const userC = new Types.ObjectId();

let workspaceId: Types.ObjectId;
let channelId: Types.ObjectId;
let tokenA: string;
let tokenB: string;
let tokenC: string;

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

describe("Phase 7 - Message API", () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI_TEST_REPLACE = mongod.getUri();

    app = await createTestApp();

    tokenA = jwt.sign(
      { id: userA.toString(), email: "a@test.local" },
      process.env.JWT_SECRET as string,
    );
    tokenB = jwt.sign(
      { id: userB.toString(), email: "b@test.local" },
      process.env.JWT_SECRET as string,
    );
    tokenC = jwt.sign(
      { id: userC.toString(), email: "c@test.local" },
      process.env.JWT_SECRET as string,
    );

    const workspace = await Workspace.create({
      name: "Workspace 7",
      slug: "workspace-7",
      ownerId: userA,
      members: [userA, userB],
      plan: "pro",
      channelCount: 1,
    });
    workspaceId = workspace._id as Types.ObjectId;

    const channel = await Channel.create({
      workspaceId,
      name: "general",
      slug: "general",
      type: "public",
      createdBy: userA,
      members: [userA, userB],
      memberCount: 2,
      isArchived: false,
    });
    channelId = channel._id as Types.ObjectId;

    await ChannelMember.create([
      {
        channelId,
        workspaceId,
        userId: userA,
        role: "owner",
        joinedAt: new Date(),
      },
      {
        channelId,
        workspaceId,
        userId: userB,
        role: "member",
        joinedAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await closeTestApp();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongod.stop();
  });

  it("POST /channels/:channelId/messages should send message", async () => {
    const res = await request(app)
      .post(`/api/v1/channels/${channelId.toString()}/messages`)
      .set(authHeader(tokenA))
      .send({ content: "Hello phase 7" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("Hello phase 7");
  });

  it("GET /channels/:channelId/messages should return page with cursor meta", async () => {
    const res = await request(app)
      .get(`/api/v1/channels/${channelId.toString()}/messages?limit=10`)
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.limit).toBe(10);
  });

  it("GET messages should support before cursor", async () => {
    const now = new Date();

    await Message.create({
      workspaceId,
      channelId,
      userId: userA,
      content: "Old message",
      type: "text",
      createdAt: new Date(now.getTime() - 60_000),
      updatedAt: new Date(now.getTime() - 60_000),
    });

    await Message.create({
      workspaceId,
      channelId,
      userId: userA,
      content: "New message",
      type: "text",
      createdAt: now,
      updatedAt: now,
    });

    const res = await request(app)
      .get(
        `/api/v1/channels/${channelId.toString()}/messages?before=${encodeURIComponent(now.toISOString())}&limit=10`,
      )
      .set(authHeader(tokenA));

    expect(res.status).toBe(200);
    const contents = (res.body.data || []).map((m: any) => m.content);
    expect(contents).toContain("Old message");
    expect(contents).not.toContain("New message");
  });

  it("GET messages should reject invalid timestamp cursor", async () => {
    const res = await request(app)
      .get(
        `/api/v1/channels/${channelId.toString()}/messages?before=not-a-date`,
      )
      .set(authHeader(tokenA));

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("Invalid before timestamp");
  });

  it("PATCH /messages/:messageId should edit own message", async () => {
    const message = await Message.create({
      workspaceId,
      channelId,
      userId: userA,
      content: "Need edit",
      type: "text",
    });

    const res = await request(app)
      .patch(`/api/v1/messages/${message._id.toString()}`)
      .set(authHeader(tokenA))
      .send({ content: "Edited content" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("Edited content");
  });

  it("DELETE /messages/:messageId should soft-delete message", async () => {
    const message = await Message.create({
      workspaceId,
      channelId,
      userId: userB,
      content: "Delete me",
      type: "text",
    });

    const res = await request(app)
      .delete(`/api/v1/messages/${message._id.toString()}`)
      .set(authHeader(tokenB));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isDeleted).toBe(true);
  });

  it("should enforce permission for non-channel-member user", async () => {
    const res = await request(app)
      .post(`/api/v1/channels/${channelId.toString()}/messages`)
      .set(authHeader(tokenC))
      .send({ content: "I should not send this" });

    expect(res.status).toBe(403);
  });
});
