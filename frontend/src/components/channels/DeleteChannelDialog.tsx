'use client';

import { createPortal } from 'react-dom';

interface DeleteChannelDialogProps {
  isOpen: boolean;
  channelName?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteChannelDialog({
  isOpen,
  channelName,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteChannelDialogProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onCancel}
      style={{ margin: 0 }}
    >
      <div
        className="w-full max-w-[30%] rounded-2xl border border-[#e1e2e4] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad6] text-[#93000a]">
            <span className="material-symbols-outlined">delete_forever</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#191c1e]">
              Delete Channel
            </h3>
            <p className="text-sm text-[#516070]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-[#f3c8c4] bg-[#fff6f5] px-4 py-3 text-sm text-[#6f3d39]">
          {channelName
            ? `You are about to permanently delete \"${channelName}\" and its related data.`
            : 'You are about to permanently delete this channel and its related data.'}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-[#c3c6d7] px-4 py-2.5 cursor-pointer font-medium text-[#516070] transition-colors hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-[#ba1a1a] px-4 py-2.5 font-medium cursor-pointer text-white transition-colors hover:bg-[#991313] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete Channel'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
