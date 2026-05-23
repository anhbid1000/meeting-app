export interface FileAssetItem {
  _id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  channelId: string;
  workspaceId: string;
  messageId?: string;
  createdAt: string;
}

export interface ChannelLinkItem {
  url: string;
  messageId: string;
  userId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadSignaturePayload {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  uploadUrl: string;
  fileName: string;
  mimeType: string;
}
