// src/dao/WorkspaceInviteDAO.ts
import WorkspaceInvite, {
  IWorkspaceInvite
} from '../models/WorkspaceInvite.model';
import { BaseDAO } from './BaseDAO';

export class WorkspaceInviteDAO extends BaseDAO<IWorkspaceInvite> {
  constructor() {
    super(WorkspaceInvite);
  }

  async findByCode(code: string) {
    return this.model.findOne({ code }).lean();
  }

  async listPendingByWorkspace(workspaceId: string) {
    return this.model
      .find({ workspaceId, status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
  }

  async incrementUsedCount(inviteId: string) {
    return this.model
      .findByIdAndUpdate(
        inviteId,
        { $inc: { usedCount: 1 } },
        { new: true }
      )
      .lean();
  }
}