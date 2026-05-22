import axios from 'axios';
import api from './api';
import type {
  FileAssetItem,
  ChannelLinkItem,
  PaginatedResponse,
  UploadSignaturePayload,
} from '@/types/file';

type UploadProgressCallback = (progressPercent: number) => void;

const resolveUploadUrl = (uploadUrl: string, mimeType: string) => {
  const normalizedMime = String(mimeType || '').toLowerCase();
  const isImage = normalizedMime.startsWith('image/');
  const isVideo = normalizedMime.startsWith('video/');

  if (isImage || isVideo) {
    return uploadUrl;
  }

  // Defensive fallback: older backend instances may still return /auto/upload
  // or /image/upload for documents, which can lead to 401 delivery on PDF/docs.
  return uploadUrl
    .replace('/auto/upload', '/raw/upload')
    .replace('/image/upload', '/raw/upload')
    .replace('/video/upload', '/raw/upload');
};

export const fileApi = {
  async getUploadSignature(params: {
    channelId: string;
    fileName: string;
    mimeType: string;
  }): Promise<UploadSignaturePayload> {
    const response = await api.post('/api/v1/files/upload', params);
    return response.data?.data;
  },

  async uploadFileToCloudinary(
    channelId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ) {
    const mimeType = file.type || 'application/octet-stream';
    const signature = await this.getUploadSignature({
      channelId,
      fileName: file.name,
      mimeType,
    });
    const effectiveUploadUrl = resolveUploadUrl(signature.uploadUrl, mimeType);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', String(signature.timestamp));
    formData.append('signature', signature.signature);
    formData.append('folder', signature.folder);

    const uploadResponse = await axios.post(effectiveUploadUrl, formData, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        const progressPercent = Math.min(
          100,
          Math.round((event.loaded * 100) / event.total)
        );
        onProgress(progressPercent);
      },
    });

    const secureUrl = uploadResponse.data?.secure_url || uploadResponse.data?.url;
    if (!secureUrl) {
      throw new Error('Upload failed: missing file URL from Cloudinary');
    }

    return {
      url: secureUrl,
      name: file.name,
      mimeType,
      size: file.size,
    };
  },

  async getChannelFiles(
    channelId: string,
    query?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FileAssetItem>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/v1/channels/${channelId}/files${suffix}`);
    return response.data;
  },

  async getChannelMedia(
    channelId: string,
    query?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FileAssetItem>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/v1/channels/${channelId}/media${suffix}`);
    return response.data;
  },

  async getChannelLinks(
    channelId: string,
    query?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ChannelLinkItem>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/v1/channels/${channelId}/links${suffix}`);
    return response.data;
  },
};
