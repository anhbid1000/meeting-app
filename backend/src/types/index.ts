import { Request } from 'express';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface AuthUser {
  id: string;
  email?: string;
  plan?: 'standard' | 'pro' | string;
}

export interface WorkspaceMemberContext {
  workspaceId: string;
  role: WorkspaceRole;
}

export interface ChannelMemberContext {
  channelId: string;
  role: 'owner' | 'admin' | 'member';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  workspaceMember?: WorkspaceMemberContext;
  channelMember?: ChannelMemberContext;
}
