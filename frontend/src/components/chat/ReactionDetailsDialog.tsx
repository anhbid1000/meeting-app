import React from 'react';
import type { ChatMessage } from '@/types/message';

interface ReactionDetailsDialogProps {
  isOpen: boolean;
  message: ChatMessage | null;
  currentUserId?: string;
  resolveUserName?: (userId: string) => string;
  resolveUserAvatar?: (userId: string) => string | undefined;
  onClose: () => void;
  onToggleReaction: (
    messageId: string,
    emoji: string,
    hasReacted: boolean
  ) => void;
}

export default function ReactionDetailsDialog({
  isOpen,
  message,
  currentUserId,
  resolveUserName,
  resolveUserAvatar,
  onClose,
  onToggleReaction,
}: ReactionDetailsDialogProps) {
  if (!isOpen || !message) return null;

  const reactions = (message.reactions || []).slice();
  const totalReactions = reactions.reduce((sum, item) => sum + item.count, 0);

  const reactionRows = reactions.flatMap((reaction) =>
    (reaction.users || []).map((userId) => {
      const normalizedId = String(userId);
      const isYou = normalizedId === String(currentUserId || '');

      return {
        key: `${reaction.emoji}-${normalizedId}`,
        emoji: reaction.emoji,
        userId: normalizedId,
        displayName: isYou
          ? 'You'
          : resolveUserName
            ? resolveUserName(normalizedId)
            : `User ${normalizedId.slice(0, 8)}`,
        avatar: resolveUserAvatar ? resolveUserAvatar(normalizedId) : undefined,
      };
    })
  );

  const uniqueByUser = new Map<
    string,
    { userId: string; displayName: string; avatar?: string; emojis: string[] }
  >();

  reactionRows.forEach((row) => {
    const existing = uniqueByUser.get(row.userId);
    if (existing) {
      existing.emojis.push(row.emoji);
      return;
    }

    uniqueByUser.set(row.userId, {
      userId: row.userId,
      displayName: row.displayName,
      avatar: row.avatar,
      emojis: [row.emoji],
    });
  });

  const usersSummary = Array.from(uniqueByUser.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0f172a]/45 px-4">
      <div className="w-full max-w-[40%] rounded-2xl border border-[#d7dce8] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-[#e3e7ef] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[#1f2328]">Reactions</h3>
            <p className="mt-0.5 text-xs text-[#6d7586]">
              {totalReactions} total reactions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-[#687183] hover:bg-[#f1f3f8]"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-4 px-4 py-3">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6d7586]">
              Emojis
            </p>
            {reactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d3d8e5] bg-[#fafbff] p-3 text-xs text-[#7b8496]">
                No reactions yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {reactions.map((reaction) => {
                  const hasReacted = (reaction.users || []).some(
                    (userId) => String(userId) === String(currentUserId || '')
                  );

                  return (
                    <button
                      key={`${message._id}-${reaction.emoji}`}
                      type="button"
                      onClick={() =>
                        onToggleReaction(
                          message._id,
                          reaction.emoji,
                          hasReacted
                        )
                      }
                      className={`cursor-pointer inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
                        hasReacted
                          ? 'border-[#a8bdf1] bg-[#edf3ff] text-[#244a97]'
                          : 'border-[#d3d8e5] bg-white text-[#586173] hover:bg-[#f5f7fc]'
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="font-semibold">{reaction.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6d7586]">
              Who reacted and what
            </p>
            {usersSummary.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d3d8e5] bg-[#fafbff] p-3 text-xs text-[#7b8496]">
                No participants yet.
              </div>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {usersSummary.map((user) => {
                  const initial = user.displayName.slice(0, 1).toUpperCase();

                  return (
                    <li
                      key={user.userId}
                      className="flex items-center justify-between rounded-xl border border-[#e2e6ef] bg-[#fbfcff] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#dbe7ff] text-[11px] font-semibold text-[#2a4c97]">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initial
                          )}
                        </span>
                        <span className="truncate text-sm text-[#1f2328]">
                          {user.displayName}
                        </span>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-1">
                        {user.emojis.map((emoji, idx) => (
                          <span
                            key={`${user.userId}-${emoji}-${idx}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d3d8e5] bg-white text-sm"
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
