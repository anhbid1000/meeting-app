"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';

type WorkspaceItem = {
  _id: string;
  name: string;
  plan?: 'free' | 'pro';
};

type ChannelItem = {
  _id: string;
  name: string;
  slug: string;
};

type FileItem = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  cloudinaryUrl: string;
  downloadUrl: string;
  createdAt: string;
  channelId?: { _id: string; name: string; slug: string };
  uploadedBy?: { _id: string; name: string; email: string; avatar?: string };
};

type StorageSummary = {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  plan?: 'free' | 'pro';
};

type WorkspaceData = {
  files: FileItem[];
  storage: StorageSummary | null;
  channels: ChannelItem[];
};

type WorkspaceRole = 'owner' | 'admin' | 'member' | 'pending' | undefined;

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
};

const getFileIcon = (mime: string) => {
  if (mime.includes('image')) return 'image';
  if (mime.includes('video')) return 'movie';
  if (mime.includes('audio')) return 'audio_file';
  if (mime.includes('pdf')) return 'picture_as_pdf';
  if (mime.includes('zip') || mime.includes('rar')) return 'archive';
  return 'description';
};

const getStoragePercent = (storage?: StorageSummary | null) => {
  if (!storage?.limitBytes) return 0;
  return Math.min((storage.usedBytes / storage.limitBytes) * 100, 100);
};

const getStorageBarColor = (percent: number) => {
  if (percent >= 90) return 'bg-error';
  if (percent >= 75) return 'bg-yellow-500';
  return 'bg-primary';
};

export default function FilePage() {
  const toast = useToast();
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [allWorkspaceData, setAllWorkspaceData] = useState<Record<string, WorkspaceData>>({});
  const [workspaceRoleById, setWorkspaceRoleById] = useState<Record<string, WorkspaceRole>>({});

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleteModalRendered, setIsDeleteModalRendered] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  const activeData = useMemo(() => {
    return allWorkspaceData[selectedWorkspaceId] || { files: [], storage: null, channels: [] };
  }, [allWorkspaceData, selectedWorkspaceId]);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/workspaces/me?page=1&limit=100');
      const items = res.data?.data || [];
      setWorkspaces(items);

      // Fetch preview data for all workspaces
      const dataMap: Record<string, WorkspaceData> = {};
      const roleMap: Record<string, WorkspaceRole> = {};
      await Promise.all(items.map(async (ws: WorkspaceItem) => {
        try {
          const [filesRes, wsDetailRes] = await Promise.all([
            api.get(`/workspaces/${ws._id}/files`),
            api.get(`/workspaces/${ws._id}`)
          ]);

          dataMap[ws._id] = {
            files: filesRes.data?.data?.files || [],
            storage: filesRes.data?.data?.storage || null,
            channels: wsDetailRes.data?.data?.channels || []
          };

          roleMap[ws._id] = wsDetailRes.data?.data?.workspace?.currentUserRole as WorkspaceRole;
        } catch (e) {
          console.error(`Failed to fetch data for workspace ${ws._id}`, e);
        }
      }));
      setAllWorkspaceData(dataMap);
      setWorkspaceRoleById(roleMap);
    } catch (err) {
      console.error(err);
      toast.error('Không tải được danh sách workspace');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshWorkspaceData = async (workspaceId: string) => {
    try {
      setIsDetailLoading(true);
      const [filesRes, wsDetailRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}/files`),
        api.get(`/workspaces/${workspaceId}`)
      ]);
      setAllWorkspaceData(prev => ({
        ...prev,
        [workspaceId]: {
          files: filesRes.data?.data?.files || [],
          storage: filesRes.data?.data?.storage || null,
          channels: wsDetailRes.data?.data?.channels || []
        }
      }));
      setWorkspaceRoleById((prev) => ({
        ...prev,
        [workspaceId]: wsDetailRes.data?.data?.workspace?.currentUserRole as WorkspaceRole,
      }));
    } catch (err) {
      console.error(err);
      toast.error('Không tải được dữ liệu workspace');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const currentWorkspace = useMemo(() => workspaces.find(w => w._id === selectedWorkspaceId), [workspaces, selectedWorkspaceId]);
  const activeStoragePercent = getStoragePercent(activeData.storage);
  const activeStorageBarColor = getStorageBarColor(activeStoragePercent);
  const canDeleteInSelectedWorkspace = currentUser?.role === 'admin' || workspaceRoleById[selectedWorkspaceId] === 'owner';

  const openDeleteModal = (file: FileItem) => {
    setFileToDelete(file);
    setIsDeleteModalRendered(true);
    setTimeout(() => setDeleteModalVisible(true), 10);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setTimeout(() => {
      setIsDeleteModalRendered(false);
      setFileToDelete(null);
    }, 300);
  };

  const handleDownload = async (workspaceId: string, file: FileItem) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/files/${file._id}/download`);
      const fileUrl = res.data?.data?.downloadUrl;
      if (!fileUrl) {
        toast.error('Không lấy được link download');
        return;
      }

      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', file.originalName || 'download');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast.error((err as ApiError)?.response?.data?.message || 'Download thất bại');
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete || !selectedWorkspaceId) return;

    try {
      setIsDeletingFile(true);
      await api.delete(`/workspaces/${selectedWorkspaceId}/files/${fileToDelete._id}`);
      toast.success('Xoá file thành công');
      closeDeleteModal();
      await refreshWorkspaceData(selectedWorkspaceId);
    } catch (err) {
      console.error(err);
      toast.error((err as ApiError)?.response?.data?.message || 'Xoá file thất bại');
    } finally {
      setIsDeletingFile(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !selectedChannelId || !uploadFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('channelId', selectedChannelId);
      formData.append('file', uploadFile);

      await api.post(`/workspaces/${selectedWorkspaceId}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Upload file thành công');
      setUploadFile(null);
      const input = document.getElementById('workspace-file-input') as HTMLInputElement | null;
      if (input) input.value = '';
      refreshWorkspaceData(selectedWorkspaceId);
    } catch (err) {
      console.error(err);
      toast.error((err as ApiError)?.response?.data?.message || 'Upload file thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-on-surface-variant">Đang tải dữ liệu files...</div>;
  }

  if (view === 'dashboard') {
    return (
      <div className="p-8 space-y-10">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Trung tâm dữ liệu</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tổng quan các tập tin quan trọng từ tất cả các workspace bạn tham gia.
          </p>
        </div>

        {workspaces.map((ws) => {
          const data = allWorkspaceData[ws._id];
          const storagePercent = getStoragePercent(data?.storage);
          const storageBarColor = getStorageBarColor(storagePercent);

          return (
            <section key={ws._id} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">{ws.name}</h2>
                    <div className="mt-2 w-full max-w-[360px] sm:w-[360px]">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{formatBytes(data?.storage?.usedBytes || 0)} / {formatBytes(data?.storage?.limitBytes || 0)}</span>
                        <span>{storagePercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${storageBarColor}`}
                          style={{ width: `${storagePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedWorkspaceId(ws._id);
                    if (data?.channels?.length > 0) setSelectedChannelId(data.channels[0]._id);
                    setView('detail');
                  }}
                  className="cursor-pointer text-primary font-label-md hover:underline flex items-center gap-1"
                >
                  Xem thêm
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              {(!data || data.files.length === 0) ? (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant p-6 rounded-2xl text-center text-on-surface-variant font-body-sm">
                  Workspace này chưa có file nào được upload. Bấm “Xem thêm” để vào workspace và upload file đầu tiên.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.files.slice(0, 6).map((file) => (
                    <div key={file._id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex gap-4 items-start mb-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[28px]">{getFileIcon(file.mimeType)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-label-lg text-label-lg text-on-surface truncate" title={file.originalName}>
                            {file.originalName}
                          </h4>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            #{file.channelId?.slug || 'unknown'} • {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/50">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-on-surface-variant">Bởi {file.uploadedBy?.name || 'Unknown'}</span>
                          <span className="text-[11px] text-on-surface-variant">{new Date(file.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <a
                          href={file.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary transition-colors"
                          title="Xem trực tuyến"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {workspaces.length === 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">group_off</span>
            <p>Bạn chưa tham gia workspace nào.</p>
          </div>
        )}
      </div>
    );
  }

  // DETAIL VIEW
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('dashboard')}
          className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">{currentWorkspace?.name} - Tất cả Files</h1>
          <p className="text-sm text-on-surface-variant">Xem lịch sử và quản lý tập tin của workspace này.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Info */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-4">
          <h3 className="font-label-lg text-label-lg text-on-surface">Dung lượng lưu trữ</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Đã dùng: {formatBytes(activeData.storage?.usedBytes || 0)}</span>
              <span className="text-on-surface font-semibold uppercase">{activeData.storage?.plan || currentWorkspace?.plan || 'free'}</span>
            </div>
            <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className={`h-full transition-all ${activeStorageBarColor}`}
                style={{ width: `${activeStoragePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>{activeStoragePercent.toFixed(1)}% đã dùng</span>
              <span>Còn lại {formatBytes(activeData.storage?.remainingBytes || 0)} / Giới hạn {formatBytes(activeData.storage?.limitBytes || 0)}</span>
            </div>
          </div>
        </section>

        {/* Quick Upload */}
        <section className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider">Channel</label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
              >
                {activeData.channels.map((ch) => (
                  <option key={ch._id} value={ch._id}>#{ch.slug}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-wider">Chọn tập tin</label>
              <input
                id="workspace-file-input"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading || !uploadFile || !selectedChannelId}
              className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">upload</span>}
              Tải lên
            </button>
          </form>
        </section>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Danh sách chi tiết</h2>
          <span className="text-sm text-on-surface-variant">{activeData.files.length} tập tin</span>
        </div>

        {isDetailLoading ? (
          <div className="p-10 text-center text-on-surface-variant">Đang cập nhật danh sách...</div>
        ) : activeData.files.length === 0 ? (
          <div className="p-10 text-center text-on-surface-variant">Chưa có tập tin nào trong workspace này.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-5">Tập tin</th>
                  <th className="py-3 px-5">Kênh</th>
                  <th className="py-3 px-5">Người đăng</th>
                  <th className="py-3 px-5">Ngày upload</th>
                  <th className="py-3 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {activeData.files.map((file) => (
                  <tr key={file._id} className="hover:bg-surface-bright transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">{getFileIcon(file.mimeType)}</span>
                        <div>
                          <div className="font-medium text-on-surface">{file.originalName}</div>
                          <div className="text-[11px] text-on-surface-variant uppercase">{formatBytes(file.size)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-xs">
                        #{file.channelId?.slug}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-on-surface font-medium">{file.uploadedBy?.name}</div>
                      <div className="text-[11px] text-on-surface-variant">{file.uploadedBy?.email}</div>
                    </td>
                    <td className="py-4 px-5 text-on-surface-variant">
                      {new Date(file.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={file.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors"
                          title="Xem trực tuyến"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </a>
                        {canDeleteInSelectedWorkspace ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(file);
                            }}
                            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center bg-error text-on-error hover:opacity-90 transition-colors shadow-sm"
                            title="Xoá file"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- DELETE FILE CONFIRMATION MODAL --- */}
      {isDeleteModalRendered && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${deleteModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => !isDeletingFile && closeDeleteModal()}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl transition-all duration-200 ${deleteModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-[32px]">warning</span>
                <h3 className="text-xl font-bold text-on-surface">Xác nhận xoá file</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-on-surface-variant mb-6 leading-relaxed text-sm">
              Bạn có chắc chắn muốn xoá tập tin <strong className="text-on-surface">"{fileToDelete?.originalName}"</strong>?
              Hành động này sẽ xoá file vĩnh viễn khỏi Cloudinary và cơ sở dữ liệu. <span className="text-error font-bold underline">Không thể hoàn tác</span>.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeletingFile}
                className="cursor-pointer w-full py-3 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeletingFile ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xoá...
                  </>
                ) : (
                  'Tôi hiểu, hãy xoá file này'
                )}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={isDeletingFile}
                className="cursor-pointer w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-variant transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
