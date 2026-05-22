import { WorkspaceDAO } from '../dao/WorkspaceDAO';
import { Types } from 'mongoose';
import User from '../models/User.model';
import Workspace from '../models/Workspace.model';
import Channel from '../models/Channel.model';
import ChannelMember from '../models/ChannelMember.model';
import Message from '../models/Message.model';
import WorkspaceInvite from '../models/WorkspaceInvite.model';
import AccessRequest from '../models/AccessRequest.model';
import { slugify } from '../utils/slugify';
import { AppError } from '../utils/AppError';
import { sendWorkspaceAddedEmail } from './mail.service';

// Helper to get member limit based on plan
const getMemberLimit = (plan?: string) => {
  const planKey = String(plan || 'free').toLowerCase();
  if (planKey === 'pro') return 500;
  return 50; // free plan
};


const workspaceDAO = new WorkspaceDAO();
// const userDAO = new UserDAO(); // Inject UserDAO để lấy thông tin user

export const getMyWorkspaces = async (userId: string, page = 1, limit = 10) => {
  const { items, total } = await workspaceDAO.listByMember(userId, page, limit);

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getWorkspaceById = async (
  workspaceId: string,
  userId: string,
  appRole?: string
) => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw new AppError('workspaceId khong hop le', 400, 'WORKSPACE_ID_INVALID');
  }

  const workspace = await Workspace.findById(workspaceId)
    .populate('category', 'name slug color icon')
    .populate('ownerId', 'name email avatar')
    .populate('members.userId', 'name email avatar')
    .lean();

  if (!workspace) {
    throw new AppError('Khong tim thay workspace', 404, 'WORKSPACE_NOT_FOUND');
  }

  const memberRecord = workspace.members.find((member: any) => String(member.userId?._id || member.userId) === userId);
  const isMember = !!memberRecord;
  if (!isMember && appRole !== 'admin') {
    throw new AppError('Ban khong co quyen truy cap workspace nay', 403, 'WORKSPACE_FORBIDDEN');
  }

  if (memberRecord && memberRecord.role === 'pending' && appRole !== 'admin') {
    throw new AppError('Yêu cầu tham gia workspace của bạn đang chờ duyệt', 403, 'WORKSPACE_PENDING');
  }

  const canManageWorkspace = appRole === 'admin' || memberRecord?.role === 'owner' || memberRecord?.role === 'admin';
  const activeMembers = workspace.members.filter((member: any) => member.role !== 'pending');
  const pendingMembers = canManageWorkspace
    ? workspace.members.filter((member: any) => member.role === 'pending')
    : [];

  const channels = await Channel.find({ workspaceId: new Types.ObjectId(workspaceId) })
    .select('_id name slug description type members createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  return {
    workspace: {
      ...workspace,
      members: activeMembers,
      memberCount: activeMembers.length,
      currentUserRole: appRole === 'admin' && !memberRecord ? 'admin' : memberRecord?.role,
      pendingMembers,
    },
    channels: channels.map((channel: any) => ({
      ...channel,
      memberCount: Array.isArray(channel.members) ? channel.members.length : 0,
    })),
  };
};

export const deleteWorkspace = async (workspaceId: string, userId: string) => {
  // 1. Find workspace & verify owner
  const workspace = await workspaceDAO.findById(workspaceId);

  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  if (workspace.ownerId.toString() !== userId) {
    throw Object.assign(new Error('Bạn không có quyền xóa workspace này'), { status: 403 });
  }

  // 2. Cascade delete related collections
  const workspaceObjectId = new Types.ObjectId(workspaceId);
  await Promise.all([
    Message.deleteMany({ workspaceId: workspaceObjectId }),
    ChannelMember.deleteMany({ workspaceId: workspaceObjectId }),
    AccessRequest.deleteMany({ workspaceId: workspaceObjectId }),
    WorkspaceInvite.deleteMany({ workspaceId: workspaceObjectId }),
    Channel.deleteMany({ workspaceId: workspaceObjectId }),
    User.updateMany(
      { 'workspaces.workspaceId': workspaceObjectId },
      { $pull: { workspaces: { workspaceId: workspaceObjectId } } }
    ),
  ]);

  // 3. Delete the workspace itself
  await workspaceDAO.deleteWorkspaceById(workspaceId, userId);

  return true;
};

export const updateWorkspaceMemberRoles = async (
  workspaceId: string,
  actorId: string,
  updates: Array<{ memberId: string; role: 'admin' | 'member' }>
) => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw new AppError('workspaceId khong hop le', 400, 'WORKSPACE_ID_INVALID');
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Khong tim thay workspace', 404, 'WORKSPACE_NOT_FOUND');
  }

  const actorMembership = workspace.members.find((member) => String(member.userId) === actorId);
  if (actorMembership?.role !== 'owner') {
    throw new AppError('Chi owner moi co quyen thay doi vai tro thanh vien', 403, 'WORKSPACE_OWNER_REQUIRED');
  }

  const normalizedUpdates = Array.from(
    new Map(
      (updates || [])
        .filter((item) => item?.memberId && ['admin', 'member'].includes(item.role))
        .map((item) => [item.memberId, item])
    ).values()
  );

  if (normalizedUpdates.length === 0) {
    throw new AppError('Khong co thay doi vai tro hop le', 400, 'NO_ROLE_UPDATES');
  }

  for (const update of normalizedUpdates) {
    if (!Types.ObjectId.isValid(update.memberId)) {
      throw new AppError('memberId khong hop le', 400, 'MEMBER_ID_INVALID');
    }

    if (update.memberId === actorId) {
      throw new AppError('Khong the tu thay doi vai tro cua chinh minh', 400, 'CANNOT_UPDATE_SELF_ROLE');
    }

    const targetMembership = workspace.members.find((member) => String(member.userId) === update.memberId);
    if (!targetMembership || targetMembership.role === 'pending') {
      throw new AppError('Thanh vien khong ton tai hoac chua duoc duyet', 404, 'MEMBER_NOT_FOUND');
    }

    if (targetMembership.role === 'owner') {
      throw new AppError('Khong the thay doi vai tro owner tai day', 400, 'CANNOT_UPDATE_OWNER_ROLE');
    }

    targetMembership.role = update.role;
  }

  await workspace.save();

  await Promise.all(
    normalizedUpdates.map((update) =>
      User.updateOne(
        { _id: new Types.ObjectId(update.memberId), 'workspaces.workspaceId': workspace._id },
        { $set: { 'workspaces.$.role': update.role } }
      )
    )
  );

  return workspace;
};

export const createWorkspace = async (payload: {
  name: string;
  description?: string;
  categoryId: string;
  ownerId: string;
  members?: Array<{
    email: string;
    role?: 'owner' | 'admin' | 'member';
  }>;
  channelSetup?: 'default' | 'custom';
  customChannel?: {
    name: string;
    description?: string;
    visibility?: 'public' | 'private';
  };
}) => {
  // 1. Lookup creator plan to enforce member limits
  const creator = await User.findById(payload.ownerId).lean();
  if (!creator) {
    throw new AppError('Người dùng không tồn tại', 404, 'USER_NOT_FOUND');
  }
  const creatorPlan = (creator as any).subscriptionPlan || (creator as any).plan || 'free';
  const memberLimit = getMemberLimit(String(creatorPlan));

  // 2. Xử lý Slug (Tự động tạo và xử lý trùng)
  let slug = slugify(payload.name);
  let existing = await workspaceDAO.findBySlug(slug);
  let originalSlug = slug;
  let counter = 1;

  while (existing) {
    slug = `${originalSlug}-${counter++}`;
    // CẬP NHẬT: Gán lại vào biến existing (không dùng const ở đây)
    existing = await workspaceDAO.findBySlug(slug);
  }

  // 3. Validate category tồn tại
  const category = await import('../models/Category.model').then(({ default: Category }) =>
    Category.findById(payload.categoryId).lean()
  );

  if (!category) {
    throw new AppError('Category không tồn tại', 400, 'CATEGORY_NOT_FOUND');
  }

  const ownerObjectId = new Types.ObjectId(payload.ownerId);
  const categoryObjectId = new Types.ObjectId(payload.categoryId);

  const invitedMembers = (payload.members || []).filter(
    (member) => member.email && member.email.toLowerCase() !== ''
  );

  const uniqueInvites = Array.from(
    new Map(
      invitedMembers.map((member) => [member.email.toLowerCase(), { ...member, email: member.email.toLowerCase() }])
    ).values()
  );

  const inviteEmails = uniqueInvites
    .map((member) => member.email)
    .filter((email) => email !== undefined && email !== '');

  const users = inviteEmails.length > 0 ? await User.find({ email: { $in: inviteEmails } }) : [];
  const userByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));

  const workspaceMembers = [
    { userId: ownerObjectId, role: 'owner' as const, joinedAt: new Date() },
    ...uniqueInvites.flatMap((member) => {
      const user = userByEmail.get(member.email);
      if (!user || String(user._id) === payload.ownerId) {
        return [];
      }

      return [
        {
          userId: new Types.ObjectId(String(user._id)),
          role: member.role && member.role !== 'owner' ? member.role : 'member',
          joinedAt: new Date(),
        },
      ];
    }),
  ];

  if (workspaceMembers.length > memberLimit) {
    throw new AppError(
      `Gói hiện tại chỉ hỗ trợ tối đa ${memberLimit} thành viên trong workspace (bao gồm chủ sở hữu).`,
      400,
      'WORKSPACE_MEMBER_LIMIT_EXCEEDED'
    );
  }

  const workspace = await workspaceDAO.create({
    name: payload.name,
    slug,
    description: payload.description || '',
    category: categoryObjectId,
    ownerId: ownerObjectId,
    members: workspaceMembers,
    plan: String(creatorPlan).toLowerCase() === 'pro' ? 'pro' : 'free',
    channelCount: 0,
  });

  await Promise.all([
    User.findByIdAndUpdate(payload.ownerId, {
      $addToSet: {
        workspaces: {
          workspaceId: workspace._id,
          role: 'owner',
        },
      },
    }),
    ...workspaceMembers
      .filter((member) => String(member.userId) !== payload.ownerId && member.role !== 'owner')
      .map((member) =>
        User.findByIdAndUpdate(member.userId, {
          $addToSet: {
            workspaces: {
              workspaceId: workspace._id,
              role: member.role,
            },
          },
        })
      ),
  ]);

  // Send emails to added members
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const workspaceUrl = `${frontendUrl}/groups/${workspace._id}`;

  const addedUsers = users.filter((u) => String(u._id) !== payload.ownerId);
  addedUsers.forEach((user) => {
    sendWorkspaceAddedEmail({
      to: user.email,
      name: user.name,
      workspaceName: workspace.name,
      workspaceUrl,
      inviterName: creator.name,
    }).catch((err) => console.error("Failed to send workspace added email", err));
  });

  // Handle Channel Setup
  let channelsToCreate: any[] = [];

  if (payload.channelSetup === 'custom' && payload.customChannel) {
    channelsToCreate.push({
      workspaceId: workspace._id,
      name: payload.customChannel.name,
      slug: slugify(payload.customChannel.name),
      description: payload.customChannel.description || '',
      type: payload.customChannel.visibility || 'public',
      createdBy: ownerObjectId,
      members: payload.customChannel.visibility === 'private' ? [ownerObjectId] : workspaceMembers.map(m => m.userId),
    });
  } else {
    // Default channels
    channelsToCreate.push({
      workspaceId: workspace._id,
      name: 'General',
      slug: 'general',
      description: 'Phòng trò chuyện chung cho tất cả mọi người',
      type: 'public',
      createdBy: ownerObjectId,
      members: workspaceMembers.map(m => m.userId),
    });
    channelsToCreate.push({
      workspaceId: workspace._id,
      name: 'Announcements',
      slug: 'announcements',
      description: 'Thông báo quan trọng từ quản trị viên',
      type: 'public',
      createdBy: ownerObjectId,
      members: workspaceMembers.map(m => m.userId),
    });
  }

  if (channelsToCreate.length > 0) {
    await Channel.insertMany(channelsToCreate);
    workspace.channelCount = channelsToCreate.length;
    await workspace.save();
  }

  return workspace;
};

