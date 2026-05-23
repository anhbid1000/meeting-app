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

  async createMany(docs: Partial<IFileAsset>[]) {
    if (!docs.length) return [];
    return this.model.insertMany(docs);
  }

  async listByChannel(params: {
    channelId: string;
    page?: number;
    limit?: number;
    mimeRegex?: RegExp;
  }) {
    const { channelId, page = 1, limit = 20, mimeRegex } = params;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const filter: any = { channelId: new Types.ObjectId(channelId) };
    if (mimeRegex) {
      filter.mimeType = mimeRegex;
    }

    const [rows, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: rows,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  }
}

export const fileAssetDAO = new FileAssetDAO();
