// src/services/workspaceInvite.service.ts
import { Types } from 'mongoose';
import { WorkspaceDAO } from '../dao/WorkspaceDAO';
import { WorkspaceInviteDAO } from '../dao/WorkspaceInviteDAO';
import { generateInviteCode } from '../utils/generateInviteCode';

const workspaceDAO = new WorkspaceDAO();
const workspaceInviteDAO = new WorkspaceInviteDAO();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getMemberUserId = (member: any) => member?.userId || member;

const hasWorkspaceRole = (workspace: any, userId: string, roles: string[]) => {
  if (workspace.ownerId.toString() === userId) return true;
  return workspace.members.some((member: any) => {
    const memberUserId = getMemberUserId(member);
    return memberUserId?.toString() === userId && roles.includes(member.role);
  });
};

export const createWorkspaceInvite = async ({
  workspaceId,
  createdBy,
  maxUses,
  expiresInHours
}: {
  workspaceId: string;
  createdBy: string;
  maxUses?: number;
  expiresInHours?: number;
}) => {
  const workspace = await workspaceDAO.findById(workspaceId);

  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  const isMember = workspace.members.some(
    (member: any) => getMemberUserId(member)?.toString() === createdBy
  );

  if (!isMember) {
    throw Object.assign(
      new Error('Bạn không thuộc workspace này'),
      { status: 403 }
    );
  }

  const isAdmin = hasWorkspaceRole(workspace, createdBy, ['owner', 'admin']);

  let code = generateInviteCode();
  let existing = await workspaceInviteDAO.findByCode(code);

  while (existing) {
    code = generateInviteCode();
    existing = await workspaceInviteDAO.findByCode(code);
  }

  const expiresAt = expiresInHours
    ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    : null;

  const invite = await workspaceInviteDAO.create({
    workspaceId: new Types.ObjectId(workspaceId),
    code,
    createdBy: new Types.ObjectId(createdBy),

    // Admin tạo thì active ngay, member tạo thì pending
    status: isAdmin ? 'active' : 'pending',

    maxUses: maxUses ?? null,
    usedCount: 0,
    expiresAt,

    reviewedBy: isAdmin ? new Types.ObjectId(createdBy) : null,
    reviewedAt: isAdmin ? new Date() : null
  });

  const inviteUrl = `${FRONTEND_URL}/join/workspace/${code}`;

  return {
    invite,
    inviteUrl,
    requiresApproval: !isAdmin,
    message: isAdmin
      ? 'Invite URL đã được kích hoạt'
      : 'Invite URL đã được tạo và đang chờ admin duyệt'
  };

  
};

export const acceptWorkspaceInvite = async ({
  code,
  userId
}: {
  code: string;
  userId: string;
}) => {
  const invite = await workspaceInviteDAO.findByCode(code);

  if (!invite) {
    throw Object.assign(new Error('Invite không tồn tại'), { status: 404 });
  }

  if (invite.status === 'pending') {
    throw Object.assign(
      new Error('Invite này đang chờ admin duyệt'),
      { status: 403 }
    );
  }

  if (invite.status !== 'active') {
    throw Object.assign(
      new Error('Invite không còn hoạt động'),
      { status: 400 }
    );
  }

  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error('Invite đã hết hạn'), { status: 400 });
  }

  if (invite.maxUses && invite.usedCount >= invite.maxUses) {
    throw Object.assign(
      new Error('Invite đã đạt giới hạn sử dụng'),
      { status: 400 }
    );
  }

  const workspace = await workspaceDAO.findById(invite.workspaceId.toString());

  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  const alreadyMember = workspace.members.some(
    (member: any) => getMemberUserId(member)?.toString() === userId
  );

  if (alreadyMember) {
    return {
      message: 'Bạn đã là thành viên workspace này',
      workspace
    };
  }

  const updatedWorkspace = await workspaceDAO.updateById(
    invite.workspaceId.toString(),
    {
      $addToSet: {
        members: {
          userId: new Types.ObjectId(userId),
          role: 'member',
          joinedAt: new Date()
        }
      }
    }
  );

  await import('../models/User.model').then(({ default: User }) =>
    User.findByIdAndUpdate(userId, {
      $addToSet: {
        workspaces: {
          workspaceId: invite.workspaceId,
          role: 'member'
        }
      }
    })
  );

  await workspaceInviteDAO.incrementUsedCount(invite._id.toString());

  return {
    message: 'Tham gia workspace thành công',
    workspace: updatedWorkspace
  };
};

export const reviewWorkspaceInvite = async ({
  inviteId,
  reviewerId,
  status,
  rejectReason
}: {
  inviteId: string;
  reviewerId: string;
  status: 'active' | 'rejected';
  rejectReason?: string;
}) => {
  const invite = await workspaceInviteDAO.findById(inviteId);

  if (!invite) {
    throw Object.assign(new Error('Invite không tồn tại'), { status: 404 });
  }

  const workspace = await workspaceDAO.findById(invite.workspaceId.toString());

  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  const isAdmin = hasWorkspaceRole(workspace, reviewerId, ['owner', 'admin']);

  if (!isAdmin) {
    throw Object.assign(
      new Error('Bạn không có quyền duyệt invite'),
      { status: 403 }
    );
  }

  if (invite.status !== 'pending') {
    throw Object.assign(
      new Error('Chỉ có thể duyệt invite đang pending'),
      { status: 400 }
    );
  }

  return workspaceInviteDAO.updateById(inviteId, {
    status,
    reviewedBy: new Types.ObjectId(reviewerId),
    reviewedAt: new Date(),
    rejectReason: status === 'rejected' ? rejectReason || '' : ''
  });
};


export const listPendingWorkspaceInvites = async ({
  workspaceId,
  reviewerId
}: {
  workspaceId: string;
  reviewerId: string;
}) => {
  const workspace = await workspaceDAO.findById(workspaceId);

  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  const isAdmin = hasWorkspaceRole(workspace, reviewerId, ['owner', 'admin']);
  if (!isAdmin) {
    throw Object.assign(new Error('Bạn không có quyền xem pending invites'), { status: 403 });
  }

  return workspaceInviteDAO.listPendingByWorkspace(workspaceId);
};

export const getWorkspaceInviteByCode = async (code: string) => {
  const invite = await workspaceInviteDAO.findByCode(code);
  
  if (!invite) {
    throw Object.assign(new Error('Invite không tồn tại'), { status: 404 });
  }
   const workspace = await workspaceDAO.findById(invite.workspaceId.toString());

  // Nếu workspace đã bị xoá, vẫn trả 404 – an toàn hơn trả invite mồ côi.
  if (!workspace) {
    throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  }

  // 3️⃣ Định dạng payload trả về
  return {
    // Thông tin gốc của invite
    _id: invite._id,
    code: invite.code,
    status: invite.status,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    expiresAt: invite.expiresAt,
    createdBy: invite.createdBy,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,

    // Thêm thông tin workspace (để UI hiển “Mời vào <Workspace name>”)
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      ownerId: workspace.ownerId,
      // Nếu muốn 1 dòng duy nhất hiển thị trong UI
      // display: `${workspace.name} (${workspace.slug})`
    }
  };
};
