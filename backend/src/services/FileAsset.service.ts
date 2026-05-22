import { createHash } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import Message from "../models/Message.model";
import { PermissionService } from "./Permission.service";
import { fileAssetDAO } from "../dao/FileAssetDAO";

const getCloudinaryCredentials = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw Object.assign(new Error("Cloudinary is not configured on server"), {
      status: 500,
    });
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
};

const ensureCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
};

const LINK_REGEX = /(https?:\/\/[^\s<>"')\]]+)/gi;

type CloudinaryAssetInfo = {
  resourceType: string;
  deliveryType: string;
  publicId: string;
  format?: string;
};

const extractCloudinaryPublicId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const marker = "/upload/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx < 0) return null;

    let rest = parsed.pathname.slice(idx + marker.length);
    rest = rest.replace(/^v\d+\//, "");
    const dotIdx = rest.lastIndexOf(".");
    if (dotIdx > 0) {
      rest = rest.slice(0, dotIdx);
    }
    return rest || null;
  } catch {
    return null;
  }
};

const extractCloudinaryAssetInfo = (url: string): CloudinaryAssetInfo | null => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 4) {
      return null;
    }

    const [, resourceType, deliveryType, ...rest] = segments;
    let assetPath = rest.join("/");
    assetPath = assetPath.replace(/^v\d+\//, "");
    if (!assetPath) {
      return null;
    }

    const lastSlash = assetPath.lastIndexOf("/");
    const fileName = lastSlash >= 0 ? assetPath.slice(lastSlash + 1) : assetPath;
    const dotIdx = fileName.lastIndexOf(".");
    const extension = dotIdx > 0 ? fileName.slice(dotIdx + 1).toLowerCase() : undefined;

    if (resourceType === "raw") {
      return {
        resourceType,
        deliveryType,
        publicId: assetPath,
        format: extension,
      };
    }

    if (!extension) {
      return {
        resourceType,
        deliveryType,
        publicId: assetPath,
      };
    }

    return {
      resourceType,
      deliveryType,
      publicId: assetPath.slice(0, -(`.${extension}`.length)),
      format: extension,
    };
  } catch {
    return null;
  }
};

const fallbackPublicId = (seed: string) =>
  `legacy/${createHash("sha1").update(seed).digest("hex").slice(0, 24)}`;

const extractFileExtension = (fileName: string, url?: string): string => {
  const fromName = String(fileName || "").split(".").pop()?.trim().toLowerCase();
  if (fromName) return fromName;

  try {
    const pathname = new URL(String(url || "")).pathname;
    const fromUrl = pathname.split(".").pop()?.trim().toLowerCase();
    return fromUrl || "bin";
  } catch {
    return "bin";
  }
};

export class FileAssetService {
  static async createUploadSignature(params: {
    userId: string;
    channelId: string;
    fileName: string;
    mimeType: string;
  }) {
    const { userId, channelId } = params;
    const canUpload = await PermissionService.canSendMessage(userId, channelId);
    if (!canUpload) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to upload files"),
        { status: 403 },
      );
    }

    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfigured();

    const timestamp = Math.floor(Date.now() / 1000);
    const folderPrefix =
      process.env.CLOUDINARY_UPLOAD_FOLDER || "meeting-app/channels";
    const folder = `${folderPrefix}/${channelId}`;
    const normalizedMime = String(params.mimeType || "").toLowerCase();
    const resourceType = normalizedMime.startsWith("image/")
      ? "image"
      : normalizedMime.startsWith("video/")
        ? "video"
        : "raw";
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret,
    );

    return {
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      fileName: params.fileName,
      mimeType: params.mimeType,
    };
  }

  static async recordMessageAttachments(params: {
    userId: string;
    channelId: string;
    workspaceId: string;
    messageId: string;
    attachments: Array<{
      url: string;
      name: string;
      mimeType: string;
      size: number;
    }>;
  }) {
    const { userId, channelId, workspaceId, messageId, attachments } = params;
    if (!attachments?.length) return [];

    const docs = attachments.map((attachment, index) => {
      const seed = `${messageId}:${index}:${attachment.url}`;
      const publicId =
        extractCloudinaryPublicId(attachment.url) || fallbackPublicId(seed);

      return {
        cloudinaryUrl: attachment.url,
        cloudinaryPublicId: publicId,
        fileName: attachment.name,
        mimeType: attachment.mimeType || "application/octet-stream",
        size: Number(attachment.size || 0),
        uploadedBy: userId as any,
        channelId: channelId as any,
        workspaceId: workspaceId as any,
        messageId: messageId as any,
      };
    });

    return fileAssetDAO.createMany(docs as any);
  }

  static buildSignedPdfUrl(params: {
    url: string;
    fileName: string;
    disposition?: "inline" | "attachment";
  }) {
    const assetInfo = extractCloudinaryAssetInfo(params.url);
    if (!assetInfo?.publicId) {
      return params.url;
    }

    const format = assetInfo.format || extractFileExtension(params.fileName, params.url);
    ensureCloudinaryConfigured();
    return cloudinary.utils.private_download_url(assetInfo.publicId, format, {
      resource_type: assetInfo.resourceType,
      type: assetInfo.deliveryType || "upload",
      attachment: params.disposition === "attachment",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 10,
    });
  }

  static async getChannelFiles(params: {
    userId: string;
    channelId: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, channelId, page, limit } = params;
    const canRead = await PermissionService.canSendMessage(userId, channelId);
    if (!canRead) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to view files"),
        { status: 403 },
      );
    }

    return fileAssetDAO.listByChannel({ channelId, page, limit });
  }

  static async getChannelMedia(params: {
    userId: string;
    channelId: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, channelId, page, limit } = params;
    const canRead = await PermissionService.canSendMessage(userId, channelId);
    if (!canRead) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to view media"),
        { status: 403 },
      );
    }

    return fileAssetDAO.listByChannel({
      channelId,
      page,
      limit,
      mimeRegex: /^(image|video)\//i,
    });
  }

  static async getChannelLinks(params: {
    userId: string;
    channelId: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, channelId, page = 1, limit = 20 } = params;
    const canRead = await PermissionService.canSendMessage(userId, channelId);
    if (!canRead) {
      throw Object.assign(
        new Error("Forbidden: you must be a channel member to view links"),
        { status: 403 },
      );
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const messages = await Message.find({
      channelId,
      isDeleted: { $ne: true },
      content: { $regex: "https?://", $options: "i" },
    })
      .select("_id content userId createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const links = messages.flatMap((message: any) => {
      const content = String(message.content || "");
      const matches = content.match(LINK_REGEX) || [];
      return matches.map((url) => ({
        url,
        messageId: String(message._id),
        userId: String(message.userId),
        createdAt: message.createdAt,
      }));
    });

    const offset = (safePage - 1) * safeLimit;
    const sliced = links.slice(offset, offset + safeLimit);

    return {
      data: sliced,
      meta: {
        page: safePage,
        limit: safeLimit,
        total: links.length,
        totalPages: Math.max(1, Math.ceil(links.length / safeLimit)),
      },
    };
  }
}
