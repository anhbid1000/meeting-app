'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type ChannelSetup = 'default' | 'custom';
type MemberRole = 'owner' | 'member' | 'admin';
type ChannelVisibility = 'public' | 'private';

type SearchUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

type WorkspaceCategory = {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
};

type InvitedMember = {
  email: string;
  role: MemberRole;
  name?: string;
};

const getInitials = (email: string) => {
  const local = email.split('@')[0] || '';
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || 'U';
};

export const CreateWorkspaceModal = ({
  open,
  onClose,
  onCreated,
}: CreateWorkspaceModalProps) => {
  // Animation states
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // ---------- search ----------
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ---------- form fields ----------
  const [workspaceName, setWorkspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<WorkspaceCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [teamSize, setTeamSize] = useState('1-10');
  const [channelSetup, setChannelSetup] = useState<ChannelSetup>('default');

  // custom channel fields
  const [customChannelName, setCustomChannelName] = useState('');
  const [customChannelDescription, setCustomChannelDescription] = useState('');
  const [customChannelVisibility, setCustomChannelVisibility] =
    useState<ChannelVisibility>('public');

  // ---------- members ----------
  const [inviteEmail, setInviteEmail] = useState('');
  const authUser = useAuthStore((state) => state.user);
  const [members, setMembers] = useState<InvitedMember[]>([]);

  // ---------- loading & toast ----------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const userPlan = useMemo(() => {
    const plan = authUser?.subscriptionPlan || authUser?.plan || 'free';
    return String(plan).toLowerCase() === 'pro' ? 'pro' : 'free';
  }, [authUser]);
  const maxMembers = userPlan === 'pro' ? 500 : 50;
  const remainingMembers = Math.max(maxMembers - members.length, 0);
  const canAddMember = useMemo(
    () => inviteEmail.trim().length > 0 && members.length < maxMembers,
    [inviteEmail, members.length, maxMembers]
  );

  // Handle Animation Logic
  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setToast(null);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (authUser?.email) {
      setMembers([{ email: authUser.email.toLowerCase(), role: 'owner', name: authUser.name }]);
    }
  }, [authUser]);

  useEffect(() => {
    const keyword = inviteEmail.trim();
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        setSearchResults(res.data?.data?.users || []);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteEmail]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await api.get('/categories');
        const data = Array.isArray(res.data) ? res.data : res.data.categories || res.data.data || [];
        setCategories(data);
      } catch (err) {
        const error = err as AxiosError;
        console.error(error.message);
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // ---------- handlers ----------
  const handleSelectUser = (user: SearchUser) => {
    const email = user.email.toLowerCase();
    if (members.some((m) => m.email === email)) return;
    if (members.length >= maxMembers) {
      setToast({
        type: 'error',
        message: `Gói ${userPlan === 'pro' ? 'Pro' : 'Free'} chỉ cho phép tối đa ${maxMembers} thành viên.`,
      });
      return;
    }
    setMembers((prev) => [...prev, { email, role: 'member', name: user.name }]);
    setInviteEmail('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveMember = (email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleChangeMemberRole = (email: string, role: MemberRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role } : m))
    );
  };

  const resetForm = () => {
    setWorkspaceName('');
    setDescription('');
    setCategoryId('');
    setTeamSize('1-10');
    setChannelSetup('default');
    setCustomChannelName('');
    setCustomChannelDescription('');
    setCustomChannelVisibility('public');
    setInviteEmail('');
    setSearchResults([]);
    setShowDropdown(false);
    setMembers(
      authUser?.email
        ? [{ email: authUser.email.toLowerCase(), role: 'owner', name: authUser.name }]
        : []
    );
    setToast(null);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setToast({ type: 'error', message: 'Vui lòng chọn danh mục workspace.' });
      return;
    }

    if (members.length > maxMembers) {
      setToast({
        type: 'error',
        message: `Workspace vượt giới hạn ${maxMembers} thành viên của gói ${userPlan === 'pro' ? 'Pro' : 'Free'}.`,
      });
      return;
    }

    setIsSubmitting(true);
    setToast(null);
    try {
      const payload = {
        name: workspaceName.trim(),
        description: description.trim() || undefined,
        categoryId,
        members: members.map((member) => ({
          email: member.email.toLowerCase(),
          role: member.role,
        })),
        channelSetup,
        ...(channelSetup === 'custom' && customChannelName.trim() && {
          customChannel: {
            name: customChannelName.trim(),
            description: customChannelDescription.trim() || undefined,
            visibility: customChannelVisibility,
          },
        }),
      };

      await api.post('/workspaces', payload);
      setToast({ type: 'success', message: 'Tạo workspace thành công!' });
      onCreated?.();
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Tạo workspace thất bại, vui lòng thử lại.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-md md:p-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow z-[60] transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-3xl bg-surface rounded-xl shadow-xl border border-surface-variant overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
          }`}
      >
        {/* Header */}
        <header className="px-lg py-md border-b border-surface-variant flex items-center justify-between bg-surface-container-lowest shrink-0">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Create Workspace
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Set up a new collaborative environment for your team.
            </p>
            <p className="font-label-sm text-label-sm text-primary mt-1">
              Gói {userPlan === 'pro' ? 'Pro' : 'Free'}: {members.length}/{maxMembers} thành viên
            </p>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center gap-sm font-headline-sm text-headline-sm font-black text-primary border-r border-surface-variant pr-md">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                videocam
              </span>
              ViMeet
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
        </header>

        <div className="p-lg flex-grow overflow-y-auto">
          <div className="space-y-xl">
            {/* Workspace Details */}
            <section className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-variant pb-sm">
                Workspace Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-sm md:col-span-2">
                  <label
                    htmlFor="workspace-name"
                    className="block font-label-md text-label-md text-on-surface"
                  >
                    Workspace Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="workspace-name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full h-12 px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    placeholder="e.g. Acme Corp Design Team"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-sm md:col-span-2">
                  <label
                    htmlFor="workspace-desc"
                    className="block font-label-md text-label-md text-on-surface"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="workspace-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                    placeholder="What is this workspace for?"
                    rows={3}
                  />
                </div>
                <div className="space-y-sm">
                  <label
                    htmlFor="workspace-category"
                    className="block font-label-md text-label-md text-on-surface"
                  >
                    Danh mục
                  </label>
                  <div className="relative">
                    <select
                      id="workspace-category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-12 px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    >
                      <option value="" disabled>
                        {isCategoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label
                    htmlFor="workspace-size"
                    className="block font-label-md text-label-md text-on-surface"
                  >
                    Số thành viên dự kiến
                  </label>
                  <div className="relative">
                    <select
                      id="workspace-size"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full h-12 px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    >
                      <option value="1-10">1 - 10 người</option>
                      <option value="11-50">11 - 50 người</option>
                      {userPlan === 'pro' && (
                        <>
                          <option value="51-200">51 - 200 người</option>
                          <option value="201-500">201 - 500 người</option>
                        </>
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                    Gói {userPlan === 'pro' ? 'Pro' : 'Free'} cho phép tối đa {maxMembers} thành viên/Group.
                    Còn có thể thêm {remainingMembers} thành viên.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-variant pb-sm">
                Invite Members
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Search and select members from the system. Usage: {members.length}/{maxMembers} members.
              </p>

              <div className="relative z-10">
                <div className="flex items-center gap-sm">
                  <div className="flex-grow relative min-w-0">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                      search
                    </span>
                    <input
                      id="invite-email"
                      placeholder="Search user by name or email..."
                      type="text"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onFocus={() => {
                        if (inviteEmail.trim().length >= 2) setShowDropdown(true);
                      }}
                      className="w-full h-12 pl-12 pr-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-outline-variant bg-surface shadow-xl max-h-60 overflow-y-auto z-20 transition-all">
                    {isSearching ? (
                      <div className="px-md py-md text-sm text-on-surface-variant flex items-center gap-sm">
                        <span className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        Đang tìm...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-md py-md text-sm text-on-surface-variant break-words">
                        Không tìm thấy người dùng phù hợp
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left px-md py-sm hover:bg-surface-container-low transition-colors border-b border-surface-variant last:border-0"
                        >
                          <div className="font-label-md text-on-surface">{user.name}</div>
                          <div className="text-sm text-on-surface-variant break-all">{user.email}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-sm mt-sm">
                {members.map((member, idx) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between gap-md p-md bg-surface-container-low rounded-xl border border-surface-variant w-full transition-all hover:bg-surface-container-high"
                  >
                    <div className="flex items-center gap-md min-w-0 flex-1">
                      <span
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-label-md text-label-md ${idx % 2 === 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'
                          }`}
                      >
                        {getInitials(member.email)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface truncate">
                          {member.name || member.email.split('@')[0]}
                        </span>
                        <span className="font-body-md text-body-md text-on-surface-variant truncate">
                          {member.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-md shrink-0">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeMemberRole(member.email, e.target.value as MemberRole)}
                        disabled={member.role === 'owner'}
                        className="h-9 rounded-lg border border-outline-variant bg-surface px-md text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                      >
                        {member.role === 'owner' ? (
                          <option value="owner">Chủ sở hữu</option>
                        ) : (
                          <>
                            <option value="admin">Quản trị</option>
                            <option value="member">Thành viên</option>
                          </>
                        )}
                      </select>
                      {member.role !== 'owner' && (
                        <button
                          aria-label="Remove member"
                          className="w-9 h-9 rounded-lg hover:bg-error-container hover:text-error flex items-center justify-center text-outline transition-colors"
                          type="button"
                          onClick={() => handleRemoveMember(member.email)}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-surface-variant pb-sm">
                Channel Setup
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <label
                  className={`relative flex cursor-pointer rounded-lg border bg-surface p-md focus:outline-none transition-colors ${channelSetup === 'default' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                >
                  <input
                    checked={channelSetup === 'default'}
                    className="peer sr-only"
                    name="channel-setup"
                    type="radio"
                    value="default"
                    onChange={() => setChannelSetup('default')}
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block font-label-md text-label-md text-on-surface mb-xs">Default Channels</span>
                      <span className="mt-1 flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
                        <span className="inline-flex items-center gap-xs bg-surface-container px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-[14px]">tag</span> general
                        </span>
                        <span className="inline-flex items-center gap-xs bg-surface-container px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-[14px]">tag</span> announcements
                        </span>
                      </span>
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined ml-auto ${channelSetup === 'default' ? 'text-primary' : 'text-transparent'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </label>
                <label
                  className={`relative flex cursor-pointer rounded-lg border bg-surface p-md focus:outline-none transition-colors ${channelSetup === 'custom' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                >
                  <input
                    className="peer sr-only"
                    name="channel-setup"
                    type="radio"
                    value="custom"
                    checked={channelSetup === 'custom'}
                    onChange={() => setChannelSetup('custom')}
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block font-label-md text-label-md text-on-surface mb-xs">Create Custom Channels</span>
                      <span className="mt-1 flex items-center font-body-sm text-body-sm text-on-surface-variant">
                        Set up specific channels for your workflow right now.
                      </span>
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined ml-auto ${channelSetup === 'custom' ? 'text-primary' : 'text-transparent'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </label>
              </div>
              {channelSetup === 'custom' && (
                <div className="mt-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-md space-y-md">
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface">Tạo channel đầu tiên</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                      Nhập thông tin channel custom sẽ được tạo cùng workspace.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-sm md:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface">Tên channel</label>
                      <input
                        value={customChannelName}
                        onChange={(e) => setCustomChannelName(e.target.value)}
                        className="w-full h-12 px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                        placeholder="Ví dụ: daily-meeting, design-review"
                        type="text"
                      />
                    </div>
                    <div className="space-y-sm md:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface">Mô tả channel</label>
                      <textarea
                        value={customChannelDescription}
                        onChange={(e) => setCustomChannelDescription(e.target.value)}
                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Channel này dùng để làm gì?"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-sm md:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface">Trạng thái channel</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                        <label
                          className={`cursor-pointer rounded-lg border p-md bg-surface transition-colors ${customChannelVisibility === 'public' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container-low'
                            }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="custom-channel-visibility"
                            value="public"
                            checked={customChannelVisibility === 'public'}
                            onChange={() => setCustomChannelVisibility('public')}
                          />
                          <div className="flex items-start gap-sm">
                            <span className="material-symbols-outlined text-primary">public</span>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">Public</p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Mọi thành viên workspace đều thấy.
                              </p>
                            </div>
                          </div>
                        </label>
                        <label
                          className={`cursor-pointer rounded-lg border p-md bg-surface transition-colors ${customChannelVisibility === 'private' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container-low'
                            }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="custom-channel-visibility"
                            value="private"
                            checked={customChannelVisibility === 'private'}
                            onChange={() => setCustomChannelVisibility('private')}
                          />
                          <div className="flex items-start gap-sm">
                            <span className="material-symbols-outlined text-primary">lock</span>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">Private</p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Chỉ người được mời mới vào được.
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <footer className="px-10 py-5 pt-md border-t border-surface-variant bg-surface-container-lowest flex items-center justify-end gap-md shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer px-lg py-2.5 rounded-lg font-label-md text-label-md text-secondary hover:bg-surface-variant/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer px-lg py-2.5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md shadow-sm transition-colors flex items-center gap-sm disabled:opacity-70 min-w-[160px] justify-center"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                Create Workspace
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};
