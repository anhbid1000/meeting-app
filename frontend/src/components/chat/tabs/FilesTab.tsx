import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fileApi } from '@/services/fileApi';
import type { FileAssetItem, ChannelLinkItem } from '@/types/file';

interface FilesTabProps {
  channelId?: string;
}

type FilesFilter = 'all' | 'images' | 'documents' | 'links';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';
const PDF_MIME = 'application/pdf';
const OFFICE_MIME_PATTERNS = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const getFileCategory = (mimeType?: string) => {
  const normalizedMime = String(mimeType || '').toLowerCase();
  if (normalizedMime.startsWith(IMAGE_MIME_PREFIX)) return 'image';
  if (normalizedMime.startsWith(VIDEO_MIME_PREFIX)) return 'video';
  if (normalizedMime === PDF_MIME) return 'pdf';
  if (OFFICE_MIME_PATTERNS.includes(normalizedMime)) return 'office';
  return 'file';
};

const normalizeCloudinaryFileUrl = (url: string, mimeType?: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('res.cloudinary.com')) return url;

    const normalizedMime = String(mimeType || '').toLowerCase();
    const isImage = normalizedMime.startsWith('image/');
    const isVideo = normalizedMime.startsWith('video/');

    if (!isImage && !isVideo) {
      parsed.pathname = parsed.pathname
        .replace('/image/upload/', '/raw/upload/')
        .replace('/auto/upload/', '/raw/upload/')
        .replace('/video/upload/', '/raw/upload/');
    }

    return parsed.toString();
  } catch {
    return url;
  }
};

const buildOpenUrl = (url: string, mimeType?: string) => {
  const normalizedUrl = normalizeCloudinaryFileUrl(url, mimeType);
  const category = getFileCategory(mimeType);

  if (category === 'image' || category === 'video') {
    return normalizedUrl;
  }

  const encoded = encodeURIComponent(normalizedUrl);
  if (category === 'pdf') {
    return `${BACKEND_URL}/api/v1/files/open?url=${encoded}&mimeType=${encodeURIComponent(
      mimeType || PDF_MIME
    )}`;
  }

  if (category === 'office') {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encoded}`;
  }

  return normalizedUrl;
};

const buildDownloadUrl = (url: string, fileName: string, mimeType?: string) => {
  const normalizedUrl = normalizeCloudinaryFileUrl(url, mimeType);
  return `${BACKEND_URL}/api/v1/files/download?url=${encodeURIComponent(
    normalizedUrl
  )}&fileName=${encodeURIComponent(fileName || 'download')}&mimeType=${encodeURIComponent(
    mimeType || 'application/octet-stream'
  )}`;
};

const getFileTypeLabel = (mimeType?: string) => {
  const category = getFileCategory(mimeType);
  if (category === 'image') return 'Image';
  if (category === 'video') return 'Video';
  if (category === 'pdf') return 'PDF Document';
  if (category === 'office') return 'Office Document';
  return 'File';
};

const getFileIcon = (mimeType?: string) => {
  const category = getFileCategory(mimeType);
  if (category === 'image') return 'image';
  if (category === 'video') return 'movie';
  if (category === 'pdf') return 'picture_as_pdf';
  if (category === 'office') return 'description';
  return 'draft';
};

const formatSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FilesTab({ channelId }: FilesTabProps) {
  const [activeFilter, setActiveFilter] = React.useState<FilesFilter>('all');

  const filesQuery = useQuery({
    queryKey: ['channel-files', channelId],
    queryFn: () => fileApi.getChannelFiles(channelId as string, { limit: 100 }),
    enabled: Boolean(channelId),
    staleTime: 15000,
  });

  const mediaQuery = useQuery({
    queryKey: ['channel-media', channelId],
    queryFn: () => fileApi.getChannelMedia(channelId as string, { limit: 100 }),
    enabled: Boolean(channelId),
    staleTime: 15000,
  });

  const linksQuery = useQuery({
    queryKey: ['channel-links', channelId],
    queryFn: () => fileApi.getChannelLinks(channelId as string, { limit: 100 }),
    enabled: Boolean(channelId),
    staleTime: 15000,
  });

  const allFiles = (filesQuery.data?.data || []) as FileAssetItem[];
  const imageFiles = ((mediaQuery.data?.data || []) as FileAssetItem[]).filter(
    (item) => item.mimeType.toLowerCase().startsWith('image/')
  );
  const documentFiles = allFiles.filter((item) => {
    const mime = item.mimeType.toLowerCase();
    return !mime.startsWith('image/') && !mime.startsWith('video/');
  });
  const links = (linksQuery.data?.data || []) as ChannelLinkItem[];

  const isLoading =
    filesQuery.isLoading || mediaQuery.isLoading || linksQuery.isLoading;
  const isError = filesQuery.isError || mediaQuery.isError || linksQuery.isError;

  if (isLoading) {
    return <p className="text-sm text-[#8a90a0]">Loading shared files...</p>;
  }

  if (isError) {
    return <p className="text-sm text-[#8a90a0]">Unable to load shared files.</p>;
  }

  const activeItems =
    activeFilter === 'images'
      ? imageFiles
      : activeFilter === 'documents'
        ? documentFiles
        : activeFilter === 'all'
          ? allFiles
          : links;

  if (!activeItems.length) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'images', 'documents', 'links'] as FilesFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  activeFilter === filter
                    ? 'border-[#2b61d4] bg-[#edf3ff] text-[#2b61d4]'
                    : 'border-[#d5dbe8] bg-white text-[#727b8d] hover:text-[#2b61d4]'
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>
        <p className="text-sm text-[#8a90a0]">No shared items for this filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['all', 'images', 'documents', 'links'] as FilesFilter[]).map(
          (filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                activeFilter === filter
                  ? 'border-[#2b61d4] bg-[#edf3ff] text-[#2b61d4]'
                  : 'border-[#d5dbe8] bg-white text-[#727b8d] hover:text-[#2b61d4]'
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {activeFilter === 'links' ? (
        <ul className="space-y-2">
          {(activeItems as ChannelLinkItem[]).map((item) => (
            <li
              key={`${item.messageId}-${item.url}`}
              className="rounded-xl border border-[#e1e5ef] bg-white px-3 py-3"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-2 text-sm font-medium text-[#004ac6] hover:underline"
              >
                {item.url}
              </a>
              <p className="mt-1 text-xs text-[#8a90a0]">
                Shared {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {(activeItems as FileAssetItem[]).map((file) => (
            <li
              key={file._id}
              className="overflow-hidden rounded-[18px] border border-[#d8e0ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            >
              <a
                href={buildOpenUrl(file.cloudinaryUrl, file.mimeType)}
                target="_blank"
                rel="noreferrer"
                className="flex h-28 items-center justify-center bg-[#eef0f4]"
                title="Mở file"
              >
                {getFileCategory(file.mimeType) === 'image' ? (
                  <img
                    src={normalizeCloudinaryFileUrl(
                      file.cloudinaryUrl,
                      file.mimeType
                    )}
                    alt={file.fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[34px] text-[#4e6688]">
                    {getFileIcon(file.mimeType)}
                  </span>
                )}
              </a>

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <a
                  href={buildOpenUrl(file.cloudinaryUrl, file.mimeType)}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1"
                  title="Mở file"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffe3dd] text-[#c94938]">
                      <span className="material-symbols-outlined text-[22px]">
                        {getFileIcon(file.mimeType)}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[#172033]">
                        {file.fileName}
                      </p>
                      <p className="text-sm text-[#5f6b7e]">
                        {formatSize(file.size)} • {getFileTypeLabel(file.mimeType)}
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href={buildDownloadUrl(
                    file.cloudinaryUrl,
                    file.fileName,
                    file.mimeType
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d6ddea] text-[#44628f] hover:bg-[#eef3fb]"
                  title="Tải file"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
