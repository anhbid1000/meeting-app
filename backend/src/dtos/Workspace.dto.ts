import { z } from 'zod';
import { Types } from 'mongoose';

export const CreateWorkspaceDTO = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid category ID',
  }),
  members: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'member', 'owner']).optional(),
  })).optional(),
  channelSetup: z.enum(['default', 'custom']).optional(),
  customChannel: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    visibility: z.enum(['public', 'private']).optional(),
  }).optional(),
});