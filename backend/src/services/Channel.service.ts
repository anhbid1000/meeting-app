import { Types } from 'mongoose';
import ChannelDAO from '../dao/ChannelDAO';
import Workspace from '../models/Workspace.model';
import ChannelMember from '../models/ChannelMember.model';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';

interface CreateChannelData {
  workspaceId: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdBy: string;
  memberIds?: string[]; // For private channels
}

export const createChannel = async (data: CreateChannelData) => {
  const { workspaceId, name, description, type, createdBy, memberIds } = data;

  // 1. Check workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  // 2. Generate slug and check existence
  const slug = slugify(name);
  const existingChannel = await ChannelDAO.findBySlug(workspaceId, slug);
  if (existingChannel) {
    throw new AppError('Channel với slug này đã tồn tại trong workspace', 400, 'CHANNEL_ALREADY_EXISTS');
  }

  // 3. Determine initial members
  let initialMembers: Types.ObjectId[] = [];
  if (type === 'public') {
    // Public: all current workspace members
    initialMembers = workspace.members.map(m => m.userId as unknown as Types.ObjectId);
  } else {
    // Private: createdBy + selected members
    const uniqueMemberIds = new Set([createdBy, ...(memberIds || [])]);
    initialMembers = Array.from(uniqueMemberIds).map(id => new Types.ObjectId(id));
  }

  // 4. Create channel
  const channel = await ChannelDAO.create({
    workspaceId: new Types.ObjectId(workspaceId),
    name,
    description,
    slug,
    type,
    createdBy: new Types.ObjectId(createdBy),
    members: initialMembers
  } as any);

  // 5. Create ChannelMember records
  const channelMemberDocs = initialMembers.map(userId => ({
    channelId: channel._id,
    workspaceId: new Types.ObjectId(workspaceId),
    userId,
    role: String(userId) === createdBy ? 'owner' : 'member',
    status: 'active',
    joinedAt: new Date()
  }));

  await ChannelMember.insertMany(channelMemberDocs);

  return channel;
};
