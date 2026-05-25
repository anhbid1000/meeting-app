// NOTE: this project previously had richer file/message attachment indexing.
// Keep a no-op implementation to avoid breaking current message flow.
export const recordMessageAttachments = async (_params: {
  userId: string;
  channelId: string;
  workspaceId: string;
  messageId: string;
  attachments: any[];
}) => {
  return;
};
