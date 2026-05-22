import { Types } from "mongoose";
import ChannelMember from "../models/ChannelMember.model";
import Channel from "../models/Channel.model";
import Workspace from "../models/Workspace.model";
import Message from "../models/Message.model";
import { realtimeBus } from "../utils/realtime";
import { MessageDAO } from "../dao/MessageDAO";

const messageDAO = new MessageDAO();

const resolveWorkspaceBackedRole = async (
  workspaceId: string,
  userId: string,
): Promise<"owner" | "admin" | "member"> => {
  const workspace = await Workspace.findById(workspaceId)
    .select("ownerId members")
    .lean();

  if (!workspace) {
    throw Object.assign(new Error("Workspace not found"), { status: 404 });
  }

  if (String(workspace.ownerId) === String(userId)) {
    return "owner";
  }

  const isWorkspaceMember = (workspace.members || []).some(
    (m: any) => String(m) === String(userId),
  );
  if (!isWorkspaceMember || !Types.ObjectId.isValid(userId)) {
    return "member";
  }

  const user = await Workspace.db
    .collection("users")
    .findOne({ _id: new Types.ObjectId(userId) }, { projection: { role: 1 } });

  if (user?.role === "owner") return "owner";
  if (user?.role === "admin") return "admin";
  return "member";
};

const getActorProfile = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    return {
      id: userId,
      name: `User ${userId.slice(0, 6)}`,
      email: undefined,
      avatar: undefined,
    };
  }

  const user = await ChannelMember.db
    .collection("users")
    .findOne(
      { _id: new Types.ObjectId(userId) },
      { projection: { name: 1, email: 1, avatar: 1 } },
    );

  const fallbackName = user?.email || `User ${userId.slice(0, 6)}`;
  return {
    id: userId,
    name: user?.name || fallbackName,
    email: user?.email,
    avatar: user?.avatar,
  };
};

const emitMembershipSystemNotice = async (params: {
  workspaceId: string;
  channelId: string;
  userId: string;
  displayName: string;
  type: "joined" | "left";
}) => {
  const { workspaceId, channelId, userId, displayName, type } = params;
  const verb = type === "joined" ? "joined" : "left";

  const notice = await messageDAO.create({
    workspaceId: new Types.ObjectId(workspaceId),
    channelId: new Types.ObjectId(channelId),
    userId: new Types.ObjectId(userId),
    type: "system",
    content: `${displayName} ${verb} the channel`,
    attachments: [],
    mentions: [],
    threadCount: 0,
    isEdited: false,
    isDeleted: false,
    isPinned: false,
  } as any);

  const detailedNotice = await messageDAO.findByIdWithDetails(
    notice._id.toString(),
  );
  realtimeBus.emitEvent("message:new", detailedNotice || notice);
};

export class ChannelMemberService {
  static async addMember(
    channelId: string,
    userId: string,
    workspaceId: string,
    _role: "owner" | "admin" | "member" = "member",
  ) {
    const workspaceRole = await resolveWorkspaceBackedRole(workspaceId, userId);
    const exists = await ChannelMember.findOne({ channelId, userId }).lean();
    if (exists) {
      if (exists.role !== workspaceRole) {
        const updated = await ChannelMember.findOneAndUpdate(
          { channelId, userId },
          { $set: { role: workspaceRole } },
          { new: true },
        ).lean();
        return updated || exists;
      }
      return exists;
    }

    const actor = await getActorProfile(userId);

    const created = await ChannelMember.create({
      channelId: new Types.ObjectId(channelId),
      userId: new Types.ObjectId(userId),
      workspaceId: new Types.ObjectId(workspaceId),
      role: workspaceRole,
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isMuted: false,
      isFavorite: false,
    });

    // Keep legacy members[] and memberCount in sync for now
    await Channel.findByIdAndUpdate(channelId, {
      $addToSet: { members: new Types.ObjectId(userId) },
      $inc: { memberCount: 1 },
    }).lean();

    await emitMembershipSystemNotice({
      workspaceId,
      channelId,
      userId,
      displayName: actor.name,
      type: "joined",
    });

    realtimeBus.emitEvent("channel:member:added", {
      channelId,
      user: actor,
      role: workspaceRole,
    });

    return created.toObject();
  }

  static async removeMember(channelId: string, userId: string) {
    const channel = await Channel.findById(channelId)
      .select("workspaceId")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const actor = await getActorProfile(userId);

    await ChannelMember.deleteOne({ channelId, userId });
    await Channel.findByIdAndUpdate(channelId, {
      $pull: { members: new Types.ObjectId(userId) },
      $inc: { memberCount: -1 },
    }).lean();

    await emitMembershipSystemNotice({
      workspaceId: channel.workspaceId.toString(),
      channelId,
      userId,
      displayName: actor.name,
      type: "left",
    });

    realtimeBus.emitEvent("channel:member:removed", {
      channelId,
      user: actor,
    });

    return true;
  }

  static async updateMemberRole(
    channelId: string,
    userId: string,
    role: "owner" | "admin" | "member",
  ) {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { role } },
      { new: true },
    ).lean();
  }

  static async muteChannel(
    channelId: string,
    userId: string,
    isMuted: boolean,
  ) {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { isMuted } },
      { new: true },
    ).lean();
  }

  static async favoriteChannel(
    channelId: string,
    userId: string,
    isFavorite: boolean,
  ) {
    return ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { isFavorite } },
      { new: true },
    ).lean();
  }

  static async getChannelMembers(channelId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ChannelMember.find({ channelId })
        .sort({ role: 1, joinedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ChannelMember.countDocuments({ channelId }),
    ]);

    const userIds = Array.from(
      new Set(
        items
          .map((item: any) => String(item.userId))
          .filter((id) => Types.ObjectId.isValid(id)),
      ),
    ).map((id) => new Types.ObjectId(id));

    const users = userIds.length
      ? await ChannelMember.db
          .collection("users")
          .find(
            { _id: { $in: userIds } },
            { projection: { name: 1, email: 1, avatar: 1 } },
          )
          .toArray()
      : [];

    const userMap = new Map(users.map((user: any) => [String(user._id), user]));

    const enrichedItems = items.map((item: any) => {
      const userId = String(item.userId);
      const user = userMap.get(userId);

      return {
        ...item,
        userId: {
          _id: userId,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar,
        },
      };
    });

    return {
      data: enrichedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getInviteCandidates(channelId: string) {
    const channel = await Channel.findById(channelId)
      .select("workspaceId members")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const workspace = await Workspace.findById(channel.workspaceId)
      .select("members")
      .lean();
    if (!workspace) {
      throw Object.assign(new Error("Workspace not found"), { status: 404 });
    }

    const channelMemberSet = new Set(
      (channel.members || []).map((id: any) => String(id)),
    );

    const candidateIds = (workspace.members || [])
      .map((id: any) => String(id))
      .filter((id: string) => !channelMemberSet.has(id))
      .filter((id: string) => Types.ObjectId.isValid(id));

    const users = candidateIds.length
      ? await Workspace.db
          .collection("users")
          .find(
            { _id: { $in: candidateIds.map((id) => new Types.ObjectId(id)) } },
            { projection: { name: 1, email: 1, avatar: 1, role: 1 } },
          )
          .toArray()
      : [];

    return {
      success: true,
      data: users.map((user: any) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      })),
    };
  }

  static async inviteMember(params: {
    channelId: string;
    inviterId: string;
    targetUserId: string;
  }) {
    const { channelId, targetUserId } = params;

    if (!Types.ObjectId.isValid(targetUserId)) {
      throw Object.assign(new Error("Invalid target user"), { status: 400 });
    }

    const channel = await Channel.findById(channelId)
      .select("workspaceId members")
      .lean();
    if (!channel) {
      throw Object.assign(new Error("Channel not found"), { status: 404 });
    }

    const isAlreadyMember = (channel.members || []).some(
      (m: any) => String(m) === targetUserId,
    );
    if (isAlreadyMember) {
      throw Object.assign(new Error("User is already a channel member"), {
        status: 400,
      });
    }

    const workspace = await Workspace.findById(channel.workspaceId)
      .select("members")
      .lean();
    if (!workspace) {
      throw Object.assign(new Error("Workspace not found"), { status: 404 });
    }

    const isWorkspaceMember = (workspace.members || []).some(
      (m: any) => String(m) === targetUserId,
    );
    if (!isWorkspaceMember) {
      throw Object.assign(
        new Error("Target user is not a member of this workspace"),
        {
          status: 400,
        },
      );
    }

    const added = await this.addMember(
      channelId,
      targetUserId,
      channel.workspaceId.toString(),
      "member",
    );

    return added;
  }

  static async updateLastReadAt(
    channelId: string,
    userId: string,
    timestamp?: Date,
  ) {
    const nextReadAt = timestamp || new Date();

    const member = await ChannelMember.findOneAndUpdate(
      { channelId, userId },
      { $set: { lastReadAt: nextReadAt } },
      { new: true },
    ).lean();

    if (!member) {
      throw Object.assign(new Error('Channel member not found'), {
        status: 404,
      });
    }

    return member;
  }

  static async getUnreadCount(channelId: string, userId: string) {
    const member = await ChannelMember.findOne({ channelId, userId })
      .select('lastReadAt')
      .lean();

    if (!member) {
      throw Object.assign(new Error('Channel member not found'), {
        status: 404,
      });
    }

    const filter: any = {
      channelId: new Types.ObjectId(channelId),
      isDeleted: { $ne: true },
    };

    if (member.lastReadAt) {
      filter.createdAt = { $gt: member.lastReadAt };
    }

    return Message.countDocuments(filter);
  }
}
