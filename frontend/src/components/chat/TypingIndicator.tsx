import React from 'react';

interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, 2).join(', ')} are typing...`;

  return (
    <div className="px-6 py-1 text-sm italic text-[#6d7586]">
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3f6fd0]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3f6fd0] [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3f6fd0] [animation-delay:240ms]" />
        </span>
        {label}
      </span>
    </div>
  );
}
