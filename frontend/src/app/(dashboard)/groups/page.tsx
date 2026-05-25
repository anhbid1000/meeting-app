"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceForm';
import api from '@/services/api';

type WorkspaceCategory = {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
};

type WorkspaceItem = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: WorkspaceCategory;
  members?: Array<{ userId: string; role: string }>;
  plan?: 'free' | 'pro';
};

const getCategoryLabel = (category?: WorkspaceCategory) => {
  if (!category) return 'Khác';
  return category.name;
};

const getCategoryStyle = (category?: WorkspaceCategory) => {
  if (!category) return 'bg-surface-container-lowest';
  // Return a string representing the gradient background
  return `from-${category.color}/30 via-${category.color}/40 to-${category.color}/50`;
};

const Page = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<WorkspaceCategory[]>([]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  function showCreateWorkspaceModal() {
    setShowCreateModal(true);
  }

  function hideCreateWorkspaceModal() {
    setShowCreateModal(false);
  }

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinError(null);
      setJoinSuccess(null);

      const code = inviteCode.split('/').pop() || inviteCode.trim();
      const res = await api.post(`/workspace-invites/${code}/accept`);

      if (res.data) {
        setJoinSuccess(res.data.message || "Đã gửi yêu cầu tham gia thành công. Vui lòng chờ quản trị viên duyệt.");
        setInviteCode('');
        fetchWorkspaces();
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.message) {
        setJoinError(err.response.data.message);
      } else {
        setJoinError('Có lỗi xảy ra khi tham gia workspace. Vui lòng kiểm tra lại mã mời.');
      }
    } finally {
      setIsJoining(false);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Assuming the response is { success: true, data: [...] }
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.warn('Unexpected categories response format', res.data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategories([]);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/workspaces/me?page=1&limit=100');
      setWorkspaces(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Không tải được workspace từ backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchCategories();
  }, []);

  const allCategories = useMemo(() => {
    return ['all', ...categories.map(c => c.slug)];
  }, [categories]);

  const filteredWorkspaces = useMemo(() => {
    if (activeCategory === 'all') return workspaces;
    return workspaces.filter((workspace) => workspace.category?.slug === activeCategory);
  }, [activeCategory, workspaces]);

  return (
    <div className="pt-24 px-lg pb-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Nhóm & Không gian làm việc</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Quản lý và cộng tác với các nhóm trong không gian làm việc của bạn.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative">
            <button
              onClick={() => {
                setShowJoinModal(!showJoinModal);
                setJoinError(null);
                setJoinSuccess(null);
              }}
              className="cursor-pointer bg-surface-container-high text-primary px-lg py-md rounded-xl font-label-md text-label-md border border-outline-variant hover:bg-surface-container-highest active:scale-95 transition-all flex items-center gap-sm"
            >
              <span className="material-symbols-outlined">link</span>
              Tham gia không gian làm việc
            </button>
            {showJoinModal && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-4 z-50">
                <form onSubmit={handleJoinWorkspace} className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-on-surface">Tham gia bằng mã mời</h3>
                  <input
                    type="text"
                    placeholder="Dán mã mời hoặc link vào đây..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-lg text-sm border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                  {joinError && <p className="text-xs text-error">{joinError}</p>}
                  {joinSuccess && <p className="text-xs text-primary font-medium">{joinSuccess}</p>}
                  <button
                    type="submit"
                    disabled={isJoining || !inviteCode.trim()}
                    className="cursor-pointer bg-primary text-on-primary py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        Đang tham gia...
                      </>
                    ) : (
                      'Tham gia'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
          <button

            onClick={showCreateWorkspaceModal}
            className="cursor-pointer bg-primary text-on-primary px-lg py-md rounded-xl font-label-md text-label-md hover:bg-opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Tạo không gian làm việc
          </button>
        </div>
      </div>

      <div className="flex items-center gap-sm mb-lg overflow-x-auto pb-sm">
        {allCategories.map((slug) => (
          <button
            key={slug}
            onClick={() => setActiveCategory(slug)}
            className={`cursor-pointer px-md py-sm rounded-full font-label-md text-label-md transition-colors whitespace-nowrap ${activeCategory === slug
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
          >
            {slug === 'all' ? 'All' : categories.find(c => c.slug === slug)?.name || slug}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg text-on-surface-variant">
          Đang tải workspace...
        </div>
      ) : error ? (
        <div className="bg-error-container/30 border border-error/40 rounded-xl p-lg text-error">
          {error}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg text-on-surface-variant">
          {activeCategory === 'all' ? 'Không có Workspace' : 'Không có workspace nào trong category này.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className={`relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br ${getCategoryStyle(
                  workspace.category
                )}`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                    {getCategoryLabel(workspace.category)}
                  </span>
                </div>
              </div>

              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">
                {workspace.name}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2 min-h-10">
                {workspace.description || 'Workspace chưa có mô tả.'}
              </p>

              <div className="flex items-center gap-sm mb-lg">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {(workspace as any).memberCount || workspace.members?.length || 0}/{workspace.plan === 'pro' ? 500 : 50} members
                </span>
              </div>

              <Link
                href={`/groups/${workspace._id}`}
                className="w-full font-bold bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
              >
                Truy cập {workspace.name}
              </Link>
            </div>
          ))}
        </div>
      )}

      <CreateWorkspaceModal open={showCreateModal} onClose={hideCreateWorkspaceModal} onCreated={fetchWorkspaces} />
    </div>
  );
};

export default Page;
