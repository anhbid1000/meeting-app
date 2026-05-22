// src/services/workspaceInvite.service.ts
import { Types } from 'mongoose';
import { WorkspaceDAO } from '../dao/WorkspaceDAO';
import { WorkspaceInviteDAO } from '../dao/WorkspaceInviteDAO';
import User from '../models/User.model';
import { sendWorkspaceJoinRequestEmail } from './mail.service';
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
}: {
  workspaceId: string;
  createdBy: string;
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

  // Tìm invite đang active và chưa hết hạn của workspace này
  let invite = await workspaceInviteDAO.findActiveByWorkspace(workspaceId);

  if (!invite) {
    let code = generateInviteCode();
    let existing = await workspaceInviteDAO.findByCode(code);

    while (existing) {
      code = generateInviteCode();
      existing = await workspaceInviteDAO.findByCode(code);
    }

    // Thời hạn 7 ngày
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    invite = await workspaceInviteDAO.create({
      workspaceId: new Types.ObjectId(workspaceId),
      code,
      createdBy: new Types.ObjectId(createdBy),
      status: 'active',
      maxUses: null,
      usedCount: 0,
      expiresAt,
    });
  }

  const inviteUrl = `${FRONTEND_URL}/join/workspace/${invite.code}`;

  return {
    invite,
    inviteUrl,
    message: 'Lấy link mời thành công'
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

  // Get member limit from plan
  const planKey = String(workspace.plan || 'free').toLowerCase();
  const memberLimit = planKey === 'pro' ? 500 : 50;
  if (workspace.members.length >= memberLimit) {
    throw Object.assign(
      new Error(`Workspace đã đạt giới hạn thành viên (${memberLimit})`),
      { status: 400 }
    );
  }

  const memberRecord = workspace.members.find(
    (member: any) => getMemberUserId(member)?.toString() === userId
  );

  if (memberRecord) {
    if (memberRecord.role === 'pending') {
      return {
        message: 'Yêu cầu tham gia của bạn đang chờ duyệt',
        workspace
      };
    }
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
          role: 'pending',
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
          role: 'pending'
        }
      }
    })
  );

  await workspaceInviteDAO.incrementUsedCount(invite._id.toString());

  const requester = await User.findById(userId).select('name email').lean();
  const reviewerIds = workspace.members
    .filter((member: any) => member.role === 'owner' || member.role === 'admin')
    .map((member: any) => getMemberUserId(member)?.toString())
    .filter(Boolean);

  if (requester && reviewerIds.length > 0) {
    const reviewers = await User.find({ _id: { $in: reviewerIds } }).select('name email').lean();
    const workspaceUrl = `${FRONTEND_URL}/groups/${workspace._id}`;

    await Promise.allSettled(
      reviewers.map((reviewer: any) =>
        sendWorkspaceJoinRequestEmail({
          to: reviewer.email,
          adminName: reviewer.name,
          requesterName: requester.name,
          requesterEmail: requester.email,
          workspaceName: workspace.name,
          workspaceUrl,
        })
      )
    );
  }

  return {
    message: 'Yêu cầu tham gia đã được gửi và đang chờ duyệt',
    workspace: updatedWorkspace
  };
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
