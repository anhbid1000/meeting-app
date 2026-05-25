'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { channelApi } from '@/services/channelApi';

type InviteCandidate = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
};

interface InviteMembersDialogProps {
  isOpen: boolean;
  channelId?: string | null;
  onClose: () => void;
}

export default function InviteMembersDialog({
  isOpen,
  channelId,
  onClose,
}: InviteMembersDialogProps) {
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<InviteCandidate[]>([]);

  useEffect(() => {
    if (!isOpen || !channelId) return;

    const run = async () => {
      setLoading(true);
      try {
        const response = await channelApi.getInviteCandidates(channelId);
        setCandidates(Array.isArray(response?.data) ? response.data : []);
      } catch {
        toast.error('Cannot load workspace members for invite');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [isOpen, channelId]);

  const handleInvite = async (userId: string) => {
    if (!channelId) return;
    setInvitingId(userId);
    try {
      await channelApi.inviteMember(channelId, userId);
      setCandidates((prev) => prev.filter((user) => user.id !== userId));
      toast.success('Member invited to channel');
    } catch {
      toast.error('Cannot invite this member');
    } finally {
      setInvitingId(null);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#e1e2e4] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#191c1e]">
              Invite Workspace Members
            </h3>
            <p className="text-sm text-[#516070]">
              Members below are in this workspace but not in this channel yet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#687183] hover:bg-[#f2f4fa]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-[#e3e7f1]">
          {loading ? (
            <div className="px-4 py-6 text-sm text-[#687183]">
              Loading members...
            </div>
          ) : candidates.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#687183]">
              No available workspace members to invite.
            </div>
          ) : (
            <div className="divide-y divide-[#edf0f7]">
              {candidates.map((user) => {
                const name = user.name || user.email || user.id;
                const initial = name.trim().charAt(0).toUpperCase() || 'U';
                const isInviting = invitingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#dbe7ff] text-sm font-semibold text-[#2a4c97]">
                          {initial}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1f2632]">
                          {name}
                        </p>
                        <p className="truncate text-xs text-[#687183]">
                          {user.email || 'No email'}
                          {user.role ? ` • ${user.role}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isInviting}
                      onClick={() => {
                        void handleInvite(user.id);
                      }}
                      className="rounded-lg bg-[#1e5ad8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1648af] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isInviting ? 'Inviting...' : 'Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
