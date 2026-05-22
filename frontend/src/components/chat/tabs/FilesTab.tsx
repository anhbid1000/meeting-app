import React from 'react';
import type { ChatMessage } from '@/types/message';

interface FilesTabProps {
  messages: ChatMessage[];
}

export default function FilesTab({ messages }: FilesTabProps) {
  const files = messages.flatMap((message) => message.attachments || []);

  if (!files.length) {
    return <p className="text-sm text-[#8a90a0]">No shared files yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {files.map((file, index) => (
        <li
          key={`${file.url}-${index}`}
          className="rounded-xl border border-[#e1e5ef] bg-white px-3 py-3"
        >
          <p className="truncate text-sm font-semibold text-[#21262a]">
            {file.name}
          </p>
          <p className="text-xs text-[#8a90a0]">{file.mimeType}</p>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-[#004ac6] hover:underline"
          >
            Open file
          </a>
        </li>
      ))}
    </ul>
  );
}
