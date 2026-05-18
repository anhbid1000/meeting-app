import { Types } from "mongoose";

export type AppRole = "admin" | "member";
export type WorkspaceRole = "admin" | "owner" | "member";

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
    }
  }
}

export {};
