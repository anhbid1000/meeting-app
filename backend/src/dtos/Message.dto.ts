import { z } from "zod";

const MessageAttachmentDTO = z.object({
  url: z.string().url(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  fileId: z.string().optional(),
});

export const CreateMessageDTO = z
  .object({
    content: z.string().max(2000, "Message is too long").default(""),
    attachments: z.array(MessageAttachmentDTO).default([]),
    mentions: z.array(z.string()).optional(),
    type: z.enum(["text", "file", "system", "meeting"]).default("text"),
  })
  .superRefine((data, ctx) => {
    const hasContent = (data.content || "").trim().length > 0;
    const hasAttachments = (data.attachments || []).length > 0;

    if (!hasContent && !hasAttachments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Message content cannot be empty",
      });
    }
  });

export const UpdateMessageDTO = z.object({
  content: z
    .string()
    .min(1, "Message content cannot be empty")
    .max(2000, "Message is too long"),
});

export const AddReactionDTO = z.object({
  emoji: z.string().trim().min(1, "Emoji is required").max(32),
});

export type CreateMessageInput = z.infer<typeof CreateMessageDTO>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageDTO>;
export type AddReactionInput = z.infer<typeof AddReactionDTO>;
