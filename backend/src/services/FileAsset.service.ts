import { Types } from 'mongoose';
import cloudinary from '../config/cloudinary';
import FileAssetDAO from '../dao/FileAssetDAO';
import Workspace from '../models/Workspace.model';
import Channel from '../models/Channel.model';
import { AppError } from '../utils/AppError';
import crypto from 'crypto';

const GB = 1024 * 1024 * 1024;

const getWorkspaceStorageLimitBytes = (plan?: string) => {
  return String(plan || 'free').toLowerCase() === 'pro' ? 20 * GB : 2 * GB;
};

const getMembership = (workspace: any, userId: string) => {
  return workspace.members?.find((member: any) => String(member.userId) === userId);
};

const assertWorkspaceAccess = (workspace: any, userId: string, appRole?: string) => {
  if (appRole === 'admin') return;

  const membership = getMembership(workspace, userId);
  if (!membership || membership.role === 'pending') {
    throw new AppError('Bạn không có quyền truy cập file của workspace này', 403, 'WORKSPACE_FORBIDDEN');
  }
};

const buildDownloadUrl = (cloudinaryUrl: string) => {
  // Thay vì phụ thuộc vào tính năng fl_attachment của Cloudinary (dễ bị strict block/ký lỗi),
  // Dùng trick trình duyệt HTML5: Trả thẳng secure_url gốc ra cho Frontend.
  // Frontend sẽ dùng thẻ <a download> hoặc fetch blob để ép tải.
  return cloudinaryUrl;
};

const sanitizeFileName = (name: string) => {
  return name
    .replace(/\.[^/.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'file';
};

const mapCloudinaryUploadError = (error: any) => {
  const rawMessage =
    (typeof error?.message === 'string' && error.message) ||
    (typeof error?.error?.message === 'string' && error.error.message) ||
    'Cloudinary upload failed';

  if (/cloud_name mismatch/i.test(rawMessage)) {
    return new AppError(
      'Cloudinary cấu hình không khớp (cloud_name/api_key/api_secret). Vui lòng kiểm tra lại biến môi trường Cloudinary.',
      500,
      'CLOUDINARY_CONFIG_MISMATCH'
    );
  }

  if (/api key/i.test(rawMessage) || /signature/i.test(rawMessage) || /authorization/i.test(rawMessage)) {
    return new AppError(
      'Cloudinary xác thực thất bại. Vui lòng kiểm tra API Key/Secret.',
      500,
      'CLOUDINARY_AUTH_FAILED'
    );
  }

  return new AppError(rawMessage, 500, 'CLOUDINARY_UPLOAD_FAILED');
};

const getCloudinaryResourceType = (mimeType?: string): 'image' | 'video' | 'raw' => {
  if (!mimeType) return 'raw';

  if (mimeType === 'application/pdf') return 'raw';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';

  return 'raw';
};

const uploadBufferToCloudinary = (
  file: Express.Multer.File,
  workspaceId: string,
  channelId: string
) => {
  return new Promise<any>((resolve, reject) => {
    const resourceType = getCloudinaryResourceType(file.mimetype);

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: `meeting-app/workspaces/${workspaceId}/channels/${channelId}`,
        public_id: `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.originalname)}`,
        use_filename: false,
        unique_filename: true,
        // Dành cho raw files: cần thêm đuôi file (format) để url của file không bị mất đuôi
        format: resourceType === 'raw' && file.originalname.includes('.') ? file.originalname.split('.').pop() : undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(mapCloudinaryUploadError(error));
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export const getWorkspaceStorageSummary = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  const usedBytes = await FileAssetDAO.getWorkspaceUsedBytes(workspaceId);
  const limitBytes = getWorkspaceStorageLimitBytes(workspace.plan);

  return {
    usedBytes,
    limitBytes,
    remainingBytes: Math.max(limitBytes - usedBytes, 0),
    plan: workspace.plan,
  };
};

export const listWorkspaceFiles = async (workspaceId: string, userId: string, appRole?: string) => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw new AppError('workspaceId không hợp lệ', 400, 'WORKSPACE_ID_INVALID');
  }

  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  assertWorkspaceAccess(workspace, userId, appRole);

  const [files, storage] = await Promise.all([
    FileAssetDAO.listByWorkspace(workspaceId),
    getWorkspaceStorageSummary(workspaceId),
  ]);

  return { files, storage };
};

export const uploadWorkspaceFile = async ({
  workspaceId,
  channelId,
  userId,
  appRole,
  file,
}: {
  workspaceId: string;
  channelId: string;
  userId: string;
  appRole?: string;
  file: Express.Multer.File;
}) => {
  if (!Types.ObjectId.isValid(workspaceId) || !Types.ObjectId.isValid(channelId)) {
    throw new AppError('workspaceId hoặc channelId không hợp lệ', 400, 'INVALID_ID');
  }

  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  assertWorkspaceAccess(workspace, userId, appRole);

  const channel = await Channel.findOne({
    _id: new Types.ObjectId(channelId),
    workspaceId: new Types.ObjectId(workspaceId),
  }).lean();

  if (!channel) {
    throw new AppError('Channel không tồn tại trong workspace này', 404, 'CHANNEL_NOT_FOUND');
  }

  if (appRole !== 'admin' && Array.isArray(channel.members) && !channel.members.some((memberId: any) => String(memberId) === userId)) {
    throw new AppError('Bạn không thuộc channel này nên không thể upload file', 403, 'CHANNEL_FORBIDDEN');
  }

  const usedBytes = await FileAssetDAO.getWorkspaceUsedBytes(workspaceId);
  const limitBytes = getWorkspaceStorageLimitBytes(workspace.plan);

  if (usedBytes + file.size > limitBytes) {
    throw new AppError('Workspace đã vượt giới hạn lưu trữ theo gói hiện tại', 400, 'WORKSPACE_STORAGE_LIMIT_EXCEEDED');
  }

  const uploadResult = await uploadBufferToCloudinary(file, workspaceId, channelId);
  const cloudinaryUrl = uploadResult.secure_url || uploadResult.url;
  const downloadUrl = buildDownloadUrl(cloudinaryUrl);

  const asset = await FileAssetDAO.create({
    workspaceId: new Types.ObjectId(workspaceId),
    channelId: new Types.ObjectId(channelId),
    uploadedBy: new Types.ObjectId(userId),
    originalName: file.originalname,
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size,
    cloudinaryPublicId: uploadResult.public_id,
    cloudinaryResourceType: uploadResult.resource_type || getCloudinaryResourceType(file.mimetype),
    cloudinaryUrl,
    downloadUrl,
  } as any);

  const storage = await getWorkspaceStorageSummary(workspaceId);

  return { file: asset, storage };
};

export const getWorkspaceFile = async (fileId: string, userId: string, appRole?: string) => {
  const asset = await FileAssetDAO.findById(fileId);
  if (!asset) {
    throw new AppError('File không tồn tại', 404, 'FILE_NOT_FOUND');
  }

  const workspace = await Workspace.findById(asset.workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  assertWorkspaceAccess(workspace, userId, appRole);

  return asset;
};

export const getSignedDownloadUrl = async (fileId: string, userId: string, appRole?: string) => {
  const asset = await FileAssetDAO.findById(fileId);
  if (!asset) {
    throw new AppError('File không tồn tại', 404, 'FILE_NOT_FOUND');
  }

  const workspace = await Workspace.findById(asset.workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  assertWorkspaceAccess(workspace, userId, appRole);

  // Cloudinary signed URL: dùng làm link tải trực tiếp (đặc biệt hữu ích nếu asset không phải public)
  return cloudinary.url(asset.cloudinaryPublicId, {
    resource_type: asset.cloudinaryResourceType || 'raw',
    type: 'upload',
    secure: true,
    sign_url: true,
    flags: `attachment:${asset.originalName}`,
  });
};

export const deleteWorkspaceFile = async (fileId: string, userId: string, appRole?: string) => {
  const asset = await FileAssetDAO.findById(fileId);
  if (!asset) {
    throw new AppError('File không tồn tại', 404, 'FILE_NOT_FOUND');
  }

  const workspace = await Workspace.findById(asset.workspaceId).lean();
  if (!workspace) {
    throw new AppError('Workspace không tồn tại', 404, 'WORKSPACE_NOT_FOUND');
  }

  assertWorkspaceAccess(workspace, userId, appRole);
  
  // Chỉ owner hoặc admin của app mới có quyền xoá
  if (appRole !== 'admin') {
    const membership = getMembership(workspace, userId);
    if (!membership || membership.role !== 'owner') {
      throw new AppError('Chỉ chủ phòng (owner) mới có quyền xoá file', 403, 'WORKSPACE_FORBIDDEN');
    }
  }

  // Xoá trên Cloudinary trước
  try {
    await cloudinary.uploader.destroy(asset.cloudinaryPublicId, {
      resource_type: (asset.cloudinaryResourceType as any) || 'raw',
      invalidate: true,
    });
  } catch (error: any) {
    // Nếu xoá Cloudinary lỗi, không xoá DB để tránh orphan state.
    const message =
      (typeof error?.message === 'string' && error.message) ||
      (typeof error?.error?.message === 'string' && error.error.message) ||
      'Cloudinary delete failed';
    throw new AppError(message, 500, 'CLOUDINARY_DELETE_FAILED');
  }

  await FileAssetDAO.deleteById(fileId);

  const storage = await getWorkspaceStorageSummary(String(asset.workspaceId));
  return { storage };
};
