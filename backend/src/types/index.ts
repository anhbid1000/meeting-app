import { Types } from "mongoose";

import { IWorkspace } from "../models/Workspace.model";

export type AppRole = "admin" | "member";
export type WorkspaceRole = "admin" | "owner" | "member" | "pending";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

export interface WorkspaceMembership {
  workspaceId: Types.ObjectId;
  role: WorkspaceRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspace?: IWorkspace;
    }
  }
}

export {};
