import React from 'react';
import type { ChatMessage } from '@/types/message';

interface ThreadPanelProps {
  isOpen: boolean;
  message: ChatMessage | null;
  onClose: () => void;
}

export default function ThreadPanel({
  isOpen,
  message,
  onClose,
}: ThreadPanelProps) {
  if (!isOpen || !message) return null;

  return (
    <aside className="w-[320px] shrink-0 border-l border-[#e1e2e4] bg-white">
      <div className="flex items-center justify-between border-b border-[#e1e2e4] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#191c1e]">Thread</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#d7dae6] px-2 py-1 text-xs text-[#516070] hover:bg-[#f6f7fb]"
        >
          Close
        </button>
      </div>

      <div className="p-4">
        <p className="mb-2 text-xs text-[#8a90a0]">Original message</p>
        <div className="rounded-lg border border-[#e1e2e4] bg-[#fafbff] p-3 text-sm text-[#21262a]">
          {message.content}
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9fb] p-3 text-xs text-[#8a90a0]">
          Thread replies UI sẽ được nối đầy đủ ở Phase 9.
        </div>
      </div>
    </aside>
  );
}
