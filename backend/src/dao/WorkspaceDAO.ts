import Workspace, { IWorkspace } from '../models/Workspace.model';
import { BaseDAO } from './BaseDAO';
import { Types } from 'mongoose';

export class WorkspaceDAO extends BaseDAO<IWorkspace> {
  constructor() {
    super(Workspace);
  }

  async findBySlug(slug: string) {
    return this.model.findOne({ slug }).lean();
  }

  async listByMember(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const uid = new Types.ObjectId(userId);

    const [items, total] = await Promise.all([
      this.model
        .find({ 'members.userId': uid })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ 'members.userId': uid })
    ]);

    return { items, total };
  }
}