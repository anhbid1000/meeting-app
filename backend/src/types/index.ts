import { Types } from "mongoose";

import { IWorkspace } from "../models/Workspace.model";

export type AppRole = "admin" | "member";
export type WorkspaceRole = "admin" | "owner" | "member" | "pending";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  name?: string;
}

export interface WorkspaceMembership {
  workspaceId: Types.ObjectId;
  role: WorkspaceRole;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthUser;
  workspace?: IWorkspace;
  workspaceMember?: {
    workspaceId: string;
    role: WorkspaceRole;
  };
  channelMember?: {
    channelId: string;
    role: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspace?: IWorkspace;
      workspaceMember?: {
        workspaceId: string;
        role: WorkspaceRole;
      };
      channelMember?: {
        channelId: string;
        role: string;
      };
    }
  }
}

export {};
