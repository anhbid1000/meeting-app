'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

type WorkspaceCategory = {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
};

type WorkspaceMember = {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'admin' | 'member' | 'pending';
  joinedAt: string;
};

type WorkspaceDetail = {
  _id: string;
  name: string;
  description?: string;
  plan?: 'free' | 'pro';
  createdAt: string;
  ownerId?: { _id: string; name: string; email: string; avatar?: string };
  category?: WorkspaceCategory;
  members: WorkspaceMember[];
  pendingMembers?: WorkspaceMember[];
  memberCount?: number;
  currentUserRole?: 'owner' | 'admin' | 'member' | 'pending';
};

type ChannelItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'public' | 'private';
  memberCount?: number;
};

const Page = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();

  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [inviteModal, setInviteModal] = useState<
    | null
    | {
      open: boolean;
      url: string;
      code: string;
      expiresAt: string;
    }
  >(null);

  // Animation helper: keep modal mounted for exit animation
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  // Create Channel Modal state
  const [createChannelModalVisible, setCreateChannelModalVisible] = useState(false);
  const [isChannelModalRendered, setIsChannelModalRendered] = useState(false);

  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    memberIds: [] as string[],
  });
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const openCreateChannelModal = () => {
    setIsChannelModalRendered(true);
    setTimeout(() => {
      setCreateChannelModalVisible(true);
    }, 10);
  };

  const closeCreateChannelModal = () => {
    setCreateChannelModalVisible(false);
    setTimeout(() => {
      setIsChannelModalRendered(false);
      setChannelForm({ name: '', description: '', type: 'public', memberIds: [] });
    }, 300);
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    try {
      setIsCreatingChannel(true);
      await api.post(`/workspaces/${workspace._id}/channels`, channelForm);
      toast.success('Tạo channel thành công');
      closeCreateChannelModal();
      fetchWorkspaceDetail();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Tạo channel thất bại');
    } finally {
      setIsCreatingChannel(false);
    }
  };


  const closeInviteModal = () => {
    setInviteModal((prev) => (prev ? { ...prev, open: false } : null));
    window.setTimeout(() => {
      setInviteModal(null);
      setInviteModalVisible(false);
    }, 220);
  };

  useEffect(() => {
    if (inviteModal?.open) {
      setInviteModalVisible(true);
    }
  }, [inviteModal?.open]);



  const fetchWorkspaceDetail = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await api.get(`/workspaces/${groupId}`);
      const data = res.data?.data;

      setWorkspace(data?.workspace || null);
      setChannels(data?.channels || []);
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetail();
  }, [groupId]);



  const maxMembers = useMemo(() => {
    if (!workspace) return 50;
    return workspace.plan === 'pro' ? 500 : 50;
  }, [workspace]);

  const canManagePendingRequests =
    workspace?.currentUserRole === 'owner' || workspace?.currentUserRole === 'admin';

  if (isLoading) {
    return <main className="pt-16 min-h-screen p-lg">Đang tải workspace...</main>;
  }

  if (error || !workspace) {
    return <main className="pt-16 min-h-screen p-lg text-error">{error || 'Không tìm thấy workspace.'}</main>;
  }

  return (
    <main className="pt-16 min-h-screen">
      {/* Back button (giữ UI cũ, chỉ thêm nút) */}
      <Link href={`/groups/`}
        className="cursor-pointer">
        <button
          type="button"
          className="cursor-pointer fixed top-4 left-4 md:left-[calc(280px+1rem)] z-[40] flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-highest/90 px-3 py-2 shadow-md backdrop-blur-sm transition-all hover:bg-surface-container-high active:scale-[0.98]"
          aria-label="Quay lại danh sách workspace"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-label-sm text-label-sm">Quay lại</span>
        </button>
      </Link>



      <div className="p-lg max-w-7xl mx-auto">
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl mb-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg">
            <div className="flex gap-xl items-start">
              <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  groups
                </span>
              </div>
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">{workspace.name}</h2>
                  <span className="bg-secondary-container text-on-secondary-container px-sm py-0.5 rounded-full font-label-sm text-label-sm">
                    {workspace.category?.name || 'Khác'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-md">
                  {workspace.description || 'Workspace chưa có mô tả.'}
                </p>
                <div className="flex items-center gap-xl flex-wrap">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">group</span>
                    <span className="font-label-md text-label-md text-on-surface">
                      {workspace.memberCount ?? workspace.members?.length ?? 0}/{maxMembers} Members
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">shield_person</span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Owner: <span className="font-bold">{workspace.ownerId?.name || 'Unknown'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">calendar_month</span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Created {new Date(workspace.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-sm mt-md">
              <button
                onClick={async () => {
                  try {
                    const res = await api.post(`/workspaces/${workspace._id}/invites`, {});
                    const { inviteUrl, invite } = res.data;
                    setInviteModal({
                      open: true,
                      url: inviteUrl,
                      code: invite.code,
                      expiresAt: invite.expiresAt,
                    });
                  } catch (err) {
                    console.error(err);
                    toast.error('Tạo link mời thất bại');
                  }
                }}
                className="cursor-pointer bg-primary text-on-primary px-sm py-1 rounded-md hover:bg-primary/90 transition-colors"
              >
                Chia sẻ Workspace
              </button>

              <Link
                href={`/groups/${workspace._id}/members`}
                className="cursor-pointer bg-surface-container-high text-on-surface px-sm py-1 rounded-md hover:bg-surface-variant transition-colors flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                Thành viên
              </Link>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between mb-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Channels ({channels.length})</h3>
          {canManagePendingRequests && (
            <button
              onClick={openCreateChannelModal}
              className="cursor-pointer bg-primary text-on-primary px-sm py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-xs text-label-md font-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo channel
            </button>
          )}
        </div>

        {channels.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg text-on-surface-variant">
            Workspace này chưa có channel nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {channels.map((channel) => (
              <div key={channel._id} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">tag</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                        {channel.slug || channel.name}
                      </h4>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {channel.type === 'private' ? 'Private Channel' : 'Public Channel'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
                  {channel.description || 'Chưa có mô tả cho channel này.'}
                </p>
                <div className="font-label-sm text-label-sm text-on-surface-variant">
                  {channel.memberCount || 0} members
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PENDING REQUESTS SECTION --- */}
        {canManagePendingRequests && (workspace.pendingMembers?.length || 0) > 0 && (
          <div className="mt-xl bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Pending Requests</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {workspace.pendingMembers?.map((req) => {
                const initials = (req.userId?.name || '?')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={req.userId._id} className="p-md rounded-lg border border-outline-variant bg-surface-container-low flex flex-col justify-between">
                    <div className="flex items-start gap-md mb-md">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-primary-fixed text-on-primary-fixed">
                        {initials}
                      </div>
                      <div className="flex-grow">
                        <p className="font-body-md text-body-md text-on-surface">
                          <strong>{req.userId.name}</strong> yêu cầu tham gia Workspace
                        </p>
                        <span className="font-label-sm text-label-sm text-outline mt-1 block">
                          {req.userId.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <button
                        className="cursor-pointer flex-1 bg-primary text-on-primary py-1.5 rounded-lg font-label-sm text-label-sm hover:opacity-90"
                        onClick={async () => {
                          try {
                            await api.post(`/workspaces/${workspace._id}/members/${req.userId._id}/approve`);
                            await fetchWorkspaceDetail();
                            toast.success('Duyệt thành viên thành công');
                          } catch (err) {
                            console.error(err);
                            toast.error('Duyệt thành viên thất bại');
                          }
                        }}
                      >
                        Chấp nhận
                      </button>
                      <button
                        className="cursor-pointer flex-1 border border-outline text-on-surface py-1.5 rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high"
                        onClick={async () => {
                          try {
                            await api.delete(`/workspaces/${workspace._id}/members/${req.userId._id}`);
                            await fetchWorkspaceDetail();
                            toast.success('Từ chối yêu cầu thành công');
                          } catch (err) {
                            console.error(err);
                            toast.error('Từ chối yêu cầu thất bại');
                          }
                        }}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {inviteModalVisible && inviteModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 ${inviteModal.open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeInviteModal}
        >
          <div
            className={`w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl flex flex-col gap-6 transition-[transform,opacity] duration-200 ${inviteModal.open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">Workspace Invite</p>
                <h3 className="text-xl font-bold text-on-surface mt-1">
                  Mời vào {workspace.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/50">
              Người có link/mã mời này có thể tham gia workspace. Link tự động hết hạn sau 7 ngày.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Mã mời</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-surface-container-highest px-4 py-2.5 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-primary border border-outline-variant/30 select-all">
                    {inviteModal.code}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(inviteModal.code);
                      toast.success('Đã sao chép mã mời!');
                    }}
                    className="cursor-pointer w-11 h-11 shrink-0 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-primary/95 transition-all duration-150 active:scale-110 shadow-sm"
                    title="Sao chép mã"
                  >
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Liên kết mời</label>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 bg-surface-container-highest px-4 py-2.5 rounded-xl font-body-sm text-on-surface-variant border border-outline-variant/30 select-all truncate">
                    {inviteModal.url}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(inviteModal.url);
                      toast.success('Đã sao chép liên kết!');
                    }}
                    className="cursor-pointer w-11 h-11 shrink-0 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-150 active:scale-110 shadow-sm"
                    title="Sao chép liên kết"
                  >
                    <span className="material-symbols-outlined text-[20px]">link</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-error font-medium bg-error-container/20 px-3 py-2 rounded-xl border border-error/10 mt-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Hết hạn vào: {new Date(inviteModal.expiresAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE CHANNEL MODAL --- */}
      {isChannelModalRendered && workspace && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ${createChannelModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCreateChannelModal();
          }}
        >
          <div
            className={`w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl flex flex-col transition-all duration-300 transform ${createChannelModalVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}
            style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Tạo Channel mới</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Thêm một không gian thảo luận mới cho workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateChannelModal}
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Tên channel <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: announcements, team-dev..."
                  value={channelForm.name}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Mô tả (tùy chọn)</label>
                <textarea
                  placeholder="Mô tả mục đích của channel này..."
                  value={channelForm.description}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Trạng thái</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${channelForm.type === 'public' ? 'border-primary bg-primary-container/20' : 'border-outline-variant hover:bg-surface-container'}`}>
                    <input
                      type="radio"
                      name="channelType"
                      value="public"
                      checked={channelForm.type === 'public'}
                      onChange={() => setChannelForm(prev => ({ ...prev, type: 'public', memberIds: [] }))}
                      className="hidden"
                    />
                    <span className={`material-symbols-outlined ${channelForm.type === 'public' ? 'text-primary' : 'text-on-surface-variant'}`}>public</span>
                    <div>
                      <div className={`font-semibold text-sm ${channelForm.type === 'public' ? 'text-primary' : 'text-on-surface'}`}>Công khai</div>
                      <div className="text-xs text-on-surface-variant">Thêm toàn bộ thành viên</div>
                    </div>
                  </label>

                  <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${channelForm.type === 'private' ? 'border-primary bg-primary-container/20' : 'border-outline-variant hover:bg-surface-container'}`}>
                    <input
                      type="radio"
                      name="channelType"
                      value="private"
                      checked={channelForm.type === 'private'}
                      onChange={() => setChannelForm(prev => ({ ...prev, type: 'private' }))}
                      className="hidden"
                    />
                    <span className={`material-symbols-outlined ${channelForm.type === 'private' ? 'text-primary' : 'text-on-surface-variant'}`}>lock</span>
                    <div>
                      <div className={`font-semibold text-sm ${channelForm.type === 'private' ? 'text-primary' : 'text-on-surface'}`}>Riêng tư</div>
                      <div className="text-xs text-on-surface-variant">Chọn thành viên tham gia</div>
                    </div>
                  </label>
                </div>
              </div>

              {channelForm.type === 'private' && (
                <div className="mt-4 border-t border-outline-variant pt-4">
                  <label className="block text-sm font-semibold text-on-surface mb-2">Thêm thành viên</label>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {workspace.members.filter(m => m.role !== 'pending').map(member => (
                      <label key={member.userId._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors border border-transparent hover:border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                            {member.userId.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-on-surface truncate">{member.userId.name}</div>
                            <div className="text-xs text-on-surface-variant truncate">{member.userId.email}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary accent-primary"
                          checked={channelForm.memberIds.includes(member.userId._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setChannelForm(prev => ({ ...prev, memberIds: [...prev.memberIds, member.userId._id] }));
                            } else {
                              setChannelForm(prev => ({ ...prev, memberIds: prev.memberIds.filter(id => id !== member.userId._id) }));
                            }
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={closeCreateChannelModal}
                  className="cursor-pointer px-4 py-2 rounded-xl font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                  disabled={isCreatingChannel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingChannel || !channelForm.name.trim()}
                  className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingChannel ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo Channel'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};


export default Page;
