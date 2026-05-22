import { Types } from 'mongoose';
import { BaseDAO } from './BaseDAO';
import FileAsset, { IFileAsset } from '../models/FileAsset.model';

export class FileAssetDAO extends BaseDAO<IFileAsset> {
  constructor() {
    super(FileAsset);
  }

  async listByWorkspace(workspaceId: string) {
    return this.model
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate('channelId', 'name slug')
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getWorkspaceUsedBytes(workspaceId: string) {
    const result = await this.model.aggregate([
      { $match: { workspaceId: new Types.ObjectId(workspaceId) } },
      { $group: { _id: null, total: { $sum: '$size' } } },
    ]);

    return result[0]?.total || 0;
  }
}

export default new FileAssetDAO();
