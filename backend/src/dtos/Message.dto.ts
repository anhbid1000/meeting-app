import { z } from 'zod';

export const CreateMessageDTO = z.object({
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message is too long'),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string(),
        mimeType: z.string(),
        size: z.number()
      })
    )
    .optional(),
  mentions: z.array(z.string()).optional(),
  type: z.enum(['text', 'file', 'system', 'meeting']).default('text')
});

export const UpdateMessageDTO = z.object({
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message is too long')
});

export type CreateMessageInput = z.infer<typeof CreateMessageDTO>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageDTO>;
