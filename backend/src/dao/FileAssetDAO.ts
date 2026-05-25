import { Types } from 'mongoose';
import FileAsset, { IFileAsset } from '../models/FileAsset.model';

export const create = async (doc: Partial<IFileAsset>) => {
  return FileAsset.create(doc);
};

export const findById = async (id: string) => {
  return FileAsset.findById(id).lean();
};

export const deleteById = async (id: string) => {
  return FileAsset.findByIdAndDelete(id).lean();
};

export const listByWorkspace = async (workspaceId: string) => {
  return FileAsset
    .find({ workspaceId: new Types.ObjectId(workspaceId) })
    .populate('channelId', 'name slug')
    .populate('uploadedBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
};

export const getWorkspaceUsedBytes = async (workspaceId: string) => {
  const result = await FileAsset.aggregate([
    { $match: { workspaceId: new Types.ObjectId(workspaceId) } },
    { $group: { _id: null, total: { $sum: '$size' } } },
  ]);

  return result[0]?.total || 0;
};

export const createMany = async (docs: Partial<IFileAsset>[]) => {
  if (!docs.length) return [];
  return FileAsset.insertMany(docs);
};

export const listByChannel = async (params: {
  channelId: string;
  page?: number;
  limit?: number;
  mimeRegex?: RegExp;
}) => {
  const { channelId, page = 1, limit = 20, mimeRegex } = params;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const filter: any = { channelId: new Types.ObjectId(channelId) };
  if (mimeRegex) {
    filter.mimeType = mimeRegex;
  }

  const [rows, total] = await Promise.all([
    FileAsset
      .find(filter)
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    FileAsset.countDocuments(filter),
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
};
