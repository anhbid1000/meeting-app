"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

type WorkspaceMember = {
  userId:
  | {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }
  | string;
  role: "owner" | "admin" | "member" | "pending";
  joinedAt?: string;
};

type WorkspaceDetail = {
  _id: string;
  name: string;
  members: WorkspaceMember[];
  pendingMembers?: WorkspaceMember[];
  currentUserRole?: "owner" | "admin" | "member" | "pending";
};

type ToastState = null | {
  type: "success" | "error";
  message: string;
};

export default function WorkspaceMembersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);

  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "member">("all");
  const [toast, setToast] = useState<ToastState>(null);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedRoles, setEditedRoles] = useState<Record<string, 'admin' | 'member'>>({});
  const [isApplyingRoles, setIsApplyingRoles] = useState(false);
  const [isDeleteModalRendered, setIsDeleteModalRendered] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLeaveModalRendered, setIsLeaveModalRendered] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [isRemoveMemberModalRendered, setIsRemoveMemberModalRendered] = useState(false);
  const [removeMemberModalVisible, setRemoveMemberModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);

  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);
  const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const openDeleteModal = () => {
    setIsDeleteModalRendered(true);
    setTimeout(() => setDeleteModalVisible(true), 10);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setTimeout(() => setIsDeleteModalRendered(false), 300);
  };

  const openLeaveModal = () => {
    setIsLeaveModalRendered(true);
    setTimeout(() => setLeaveModalVisible(true), 10);
  };

  const closeLeaveModal = () => {
    setLeaveModalVisible(false);
    setTimeout(() => setIsLeaveModalRendered(false), 300);
  };

  const openRemoveMemberModal = (id: string, name: string) => {
    setMemberToRemove({ id, name });
    setIsRemoveMemberModalRendered(true);
    setTimeout(() => setRemoveMemberModalVisible(true), 10);
  };

  const closeRemoveMemberModal = () => {
    setRemoveMemberModalVisible(false);
    setTimeout(() => {
      setIsRemoveMemberModalRendered(false);
      setMemberToRemove(null);
    }, 300);
  };

  const fetchWorkspaceDetail = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await api.get(`/workspaces/${groupId}`);
      const payload = res.data?.data;
      setWorkspace(payload?.workspace || null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Không thể tải thông tin workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetail();
  }, [groupId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const isOwnerOrAdmin =
    workspace?.currentUserRole === "owner" || workspace?.currentUserRole === "admin";
  const isOwner = workspace?.currentUserRole === "owner";
  const isWorkspaceMember =
    workspace?.currentUserRole === "owner" || workspace?.currentUserRole === "admin" || workspace?.currentUserRole === "member";

  const activeMembers = useMemo(
    () => workspace?.members?.filter((m) => m.role !== "pending") || [],
    [workspace?.members]
  );

  const pendingMembers = useMemo(
    () => workspace?.pendingMembers || [],
    [workspace?.pendingMembers]
  );

  const handleApprove = async (memberId: string) => {
    if (!workspace?._id) return;

    try {
      await api.post(`/workspaces/${workspace._id}/members/${memberId}/approve`);
      await fetchWorkspaceDetail();
      setToast({ type: "success", message: "Duyệt thành viên thành công" });
    } catch (err) {
      console.error("Lỗi khi duyệt:", err);
      setToast({ type: "error", message: "Duyệt thành viên thất bại" });
    }
  };

  const handleReject = async (memberId: string) => {
    if (!workspace?._id) return;

    try {
      await api.delete(`/workspaces/${workspace._id}/members/${memberId}`);
      await fetchWorkspaceDetail();
      setToast({ type: "success", message: "Từ chối yêu cầu thành công" });
    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      setToast({ type: "error", message: "Từ chối yêu cầu thất bại" });
    }
  };

  const filteredActiveMembers = useMemo(() => {
    return activeMembers.filter((member) => {
      const user = typeof member.userId === "string" ? null : member.userId;
      const name = user?.name?.toLowerCase() || "";
      const email = user?.email?.toLowerCase() || "";
      const keyword = searchQuery.trim().toLowerCase();

      const searchMatch = !keyword || name.includes(keyword) || email.includes(keyword);
      const roleMatch = roleFilter === "all" || member.role === roleFilter;

      return searchMatch && roleMatch;
    });
  }, [activeMembers, roleFilter, searchQuery]);

  const pendingRoleChanges = useMemo(() => {
    return Object.entries(editedRoles)
      .map(([memberId, role]) => ({ memberId, role }))
      .filter(({ memberId, role }) => {
        const target = activeMembers.find((m) => {
          const user = typeof m.userId === 'string' ? m.userId : m.userId?._id;
          return user === memberId;
        });
        return !!target && target.role !== role;
      });
  }, [editedRoles, activeMembers]);

  const handleDeleteWorkspace = async () => {
    if (!workspace?._id || !isOwner) return;

    try {
      setIsDeletingWorkspace(true);
      await api.delete(`/workspaces/${workspace._id}`);
      setToast({ type: 'success', message: 'Đã xoá workspace thành công' });
      closeDeleteModal();
      setTimeout(() => router.push('/groups'), 700);
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Xoá workspace thất bại' });
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const handleApplyRoles = async () => {
    if (!workspace?._id || pendingRoleChanges.length === 0) return;

    try {
      setIsApplyingRoles(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      await api.patch(`/workspaces/${workspace._id}/members/roles`, { updates: pendingRoleChanges });
      await fetchWorkspaceDetail();
      setEditedRoles({});
      setToast({ type: 'success', message: 'Áp dụng phân quyền thành công' });
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Áp dụng phân quyền thất bại' });
    } finally {
      setIsApplyingRoles(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    const selfId = authUser?.id;
    if (!workspace?._id || !selfId) return;

    try {
      setIsLeavingWorkspace(true);
      await api.delete(`/workspaces/${workspace._id}/members/${selfId}`);
      setToast({ type: 'success', message: 'Đã rời khỏi workspace' });
      closeLeaveModal();
      setTimeout(() => router.push('/groups'), 700);
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Rời workspace thất bại' });
    } finally {
      setIsLeavingWorkspace(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!workspace?._id || !memberToRemove) return;

    try {
      setRemovingMemberId(memberToRemove.id);
      setOpenMemberMenuId(null);
      await api.delete(`/workspaces/${workspace._id}/members/${memberToRemove.id}`);
      await fetchWorkspaceDetail();
      setToast({ type: 'success', message: 'Đã xoá thành viên khỏi workspace' });
      closeRemoveMemberModal();
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Xoá thành viên thất bại' });
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="pt-16 min-h-screen p-lg bg-surface text-on-surface">
        Đang tải thông tin thành viên...
      </main>
    );
  }

  if (error || !workspace) {
    return (
      <main className="pt-16 min-h-screen p-lg bg-surface text-error">
        {error || "Workspace không tồn tại."}
      </main>
    );
  }

  return (
    <main className="pt-16 min-h-screen p-lg bg-surface">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg">
          <div>
            <Link
              href={`/groups/${workspace._id}`}
              className="cursor-pointer hover:underline text-primary text-sm mb-2 inline-flex items-center gap-1"
            >
              <span className=" material-symbols-outlined text-[16px]">arrow_back</span>
              Quay lại {workspace.name}
            </Link>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Quản lý thành viên</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Quản lý các thành viên và vai trò trong workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isWorkspaceMember && (
              <button
                onClick={openLeaveModal}
                disabled={isLeavingWorkspace}
                className="cursor-pointer px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLeavingWorkspace ? 'Đang rời...' : 'Rời workspace'}
              </button>
            )}
            {isOwner && (
              <button
                onClick={openDeleteModal}
                disabled={isDeletingWorkspace}
                className="cursor-pointer px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Xoá Workspace
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-outline-variant mb-lg">
          <button
            id="members-tab-active"
            onClick={() => setActiveTab("active")}
            className={`px-md py-sm font-label-md text-label-md mr-lg border-b-2 transition-colors ${activeTab === "active"
              ? "cursor-not-allowed text-primary border-primary"
              : "cursor-pointer text-on-surface-variant border-transparent hover:text-on-surface"
              }`}
          >
            Thành viên hoạt động ({activeMembers.length})
          </button>
          {isOwnerOrAdmin && (
            <button
              id="members-tab-pending"
              onClick={() => setActiveTab("pending")}
              className={`px-md py-sm font-label-md text-label-md mr-lg border-b-2 transition-colors ${activeTab === "pending"
                ? "cursor-not-allowed text-primary border-primary"
                : "cursor-pointer text-on-surface-variant border-transparent hover:text-on-surface"
                }`}
            >
              Yêu cầu chờ duyệt ({pendingMembers.length})
            </button>
          )}
        </div>

        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {activeTab === "active" ? (
            <>
              <div className="p-md flex flex-col sm:flex-row justify-between items-center gap-md border-b border-outline-variant bg-surface-bright">
                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    id="members-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên hoặc email"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 pl-xl pr-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    id="members-role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as "all" | "owner" | "admin" | "member")}
                    className="w-full sm:w-auto px-sm py-1.5 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container rounded-md transition-colors border border-outline-variant bg-surface-container-lowest focus:outline-none"
                  >
                    <option value="all">Vai trò: Tất cả</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-sm px-md font-medium">Thành viên</th>
                      <th className="py-sm px-md font-medium">Vai trò</th>
                      {isOwnerOrAdmin && <th className="py-sm px-md font-medium text-right">Tuỳ chọn</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                    {filteredActiveMembers.map((member) => {
                      const user = typeof member.userId === "string" ? null : member.userId;
                      const memberId = user?._id;
                      const canShowMemberActions =
                        !!memberId &&
                        isOwnerOrAdmin &&
                        memberId !== authUser?.id &&
                        member.role !== 'owner';

                      return (
                        <tr key={user?._id || `${member.role}-${member.joinedAt || "unknown"}`} className="hover:bg-surface-bright transition-colors">
                          <td className="py-md px-md">
                            <div className="flex items-center gap-md">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full border border-outline-variant object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg border border-outline-variant uppercase">
                                  {user?.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div>
                                <p className="font-label-md text-label-md text-on-surface">{user?.name || "Unknown"}</p>
                                <p className="text-on-surface-variant">{user?.email || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-md px-md">
                            {isOwner && user?._id && user._id !== authUser?.id && member.role !== 'owner' ? (
                              <select
                                value={editedRoles[user._id] || (member.role as 'admin' | 'member')}
                                onChange={(e) => setEditedRoles((prev) => ({ ...prev, [user._id]: e.target.value as 'admin' | 'member' }))}
                                className="cursor-pointer px-2 py-1 rounded-md border border-outline-variant bg-surface text-on-surface"
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.role === "owner"
                                  ? "bg-primary-container text-on-primary-container"
                                  : member.role === "admin"
                                    ? "bg-surface-container-high text-on-surface"
                                    : "bg-surface-variant text-on-surface-variant"
                                  }`}
                              >
                                {member.role === "owner"
                                  ? "Owner"
                                  : member.role === "admin"
                                    ? "Admin"
                                    : "Member"}
                              </span>
                            )}
                          </td>
                          {isOwnerOrAdmin && (
                            <td className="py-md px-md text-right">
                              {canShowMemberActions ? (
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={() => setOpenMemberMenuId((prev) => (prev === memberId ? null : memberId || null))}
                                    className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                  </button>

                                  {openMemberMenuId === memberId && memberId && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg z-20">
                                      <button
                                        type="button"
                                        onClick={() => openRemoveMemberModal(memberId, user?.name || 'thành viên này')}
                                        disabled={removingMemberId === memberId}
                                        className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 rounded-xl disabled:opacity-50"
                                      >
                                        Xoá khỏi workspace
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {filteredActiveMembers.length === 0 && (
                      <tr>
                        <td colSpan={isOwnerOrAdmin ? 3 : 2} className="py-md px-md text-center text-on-surface-variant">
                          Không tìm thấy thành viên nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {isOwner && (
                <div className="p-md border-t border-outline-variant flex justify-end">
                  <button
                    onClick={handleApplyRoles}
                    disabled={pendingRoleChanges.length === 0 || isApplyingRoles}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${pendingRoleChanges.length > 0
                      ? 'cursor-pointer bg-primary text-on-primary hover:bg-primary/90'
                      : 'cursor-not-allowed bg-surface-container-high text-on-surface-variant'} disabled:opacity-70`}
                  >
                    {isApplyingRoles ? 'Đang áp dụng...' : `Áp dụng phân quyền (${pendingRoleChanges.length})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-sm px-md font-medium">Người yêu cầu</th>
                    <th className="py-sm px-md font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {pendingMembers.map((req) => {
                    const user = typeof req.userId === "string" ? null : req.userId;
                    return (
                      <tr key={user?._id || `pending-${req.joinedAt || "unknown"}`} className="hover:bg-surface-bright transition-colors">
                        <td className="py-md px-md">
                          <div className="flex items-center gap-md">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border border-outline-variant object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg border border-outline-variant uppercase">
                                {user?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">{user?.name || "Unknown"}</p>
                              <p className="text-on-surface-variant">{user?.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-md px-md text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              id={`approve-member-${user?._id || "unknown"}`}
                              onClick={() => user?._id && handleApprove(user._id)}
                              className="cursor-pointer px-3 py-1 bg-primary text-on-primary text-sm rounded hover:bg-primary/90 transition-colors"
                            >
                              Duyệt
                            </button>
                            <button
                              id={`reject-member-${user?._id || "unknown"}`}
                              onClick={() => user?._id && handleReject(user._id)}
                              className="cursor-pointer px-3 py-1 bg-error/10 text-error text-sm rounded hover:bg-error/20 transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pendingMembers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-md px-md text-center text-on-surface-variant">
                        Không có yêu cầu nào chờ duyệt.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium ${toast.type === "success"
            ? "bg-primary text-on-primary border-primary"
            : "bg-error text-white border-error"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* --- LEAVE WORKSPACE MODAL --- */}
      {isLeaveModalRendered && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${leaveModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => !isLeavingWorkspace && closeLeaveModal()}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl transition-all duration-200 ${leaveModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined text-[32px]">logout</span>
                <h3 className="text-xl font-bold text-on-surface">Rời Workspace</h3>
              </div>
              <button
                type="button"
                onClick={closeLeaveModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p className="text-on-surface-variant mb-6 leading-relaxed text-sm">
              {isOwner ? (
                <>Bạn đang là <strong className="text-primary uppercase">Owner</strong>. Nếu rời khỏi workspace <strong className="text-on-surface">"{workspace.name}"</strong>, quyền sở hữu sẽ được tự động chuyển giao cho Admin hoặc thành viên khác. Bạn chắc chắn chứ?</>
              ) : (
                <>Bạn có chắc chắn muốn rời khỏi workspace <strong className="text-on-surface">"{workspace.name}"</strong>? Bạn sẽ không thể truy cập vào các kênh và dữ liệu trừ khi được mời lại.</>
              )}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleLeaveWorkspace}
                disabled={isLeavingWorkspace}
                className="cursor-pointer w-full py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLeavingWorkspace ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận rời đi'
                )}
              </button>
              <button
                onClick={closeLeaveModal}
                disabled={isLeavingWorkspace}
                className="cursor-pointer w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-variant transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REMOVE MEMBER MODAL --- */}
      {isRemoveMemberModalRendered && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${removeMemberModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => !removingMemberId && closeRemoveMemberModal()}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl transition-all duration-200 ${removeMemberModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-[32px]">person_remove</span>
                <h3 className="text-xl font-bold text-on-surface">Xoá thành viên</h3>
              </div>
              <button
                type="button"
                onClick={closeRemoveMemberModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p className="text-on-surface-variant mb-6 leading-relaxed text-sm">
              Bạn có chắc chắn muốn xoá <strong className="text-on-surface">{memberToRemove?.name}</strong> khỏi workspace? Người dùng này sẽ mất quyền truy cập vào tất cả các kênh và dữ liệu liên quan.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRemoveMember}
                disabled={!!removingMemberId}
                className="cursor-pointer w-full py-3 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {removingMemberId ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xoá...
                  </>
                ) : (
                  'Xác nhận xoá'
                )}
              </button>
              <button
                onClick={closeRemoveMemberModal}
                disabled={!!removingMemberId}
                className="cursor-pointer w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-variant transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalRendered && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${deleteModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => !isDeletingWorkspace && closeDeleteModal()}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-2xl transition-all duration-200 ${deleteModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ width: '100%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-[32px]">warning</span>
                <h3 className="text-xl font-bold text-on-surface">Xác nhận xoá</h3>
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
              Bạn có chắc chắn muốn xoá workspace <strong className="text-on-surface">"{workspace.name}"</strong>? 
              Hành động này <span className="text-error font-bold underline">không thể hoàn tác</span> và toàn bộ dữ liệu bao gồm kênh, tin nhắn sẽ bị xoá vĩnh viễn.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteWorkspace}
                disabled={isDeletingWorkspace}
                className="cursor-pointer w-full py-3 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeletingWorkspace ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xoá...
                  </>
                ) : (
                  'Tôi hiểu, hãy xoá workspace này'
                )}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={isDeletingWorkspace}
                className="cursor-pointer w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold hover:bg-surface-variant transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
