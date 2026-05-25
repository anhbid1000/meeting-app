import { z } from 'zod';

export const CreateWorkspaceInviteDTO = z.object({
  maxUses: z.number().int().min(1).optional(),
  expiresInHours: z.number().int().min(1).max(24 * 30).optional()
});

export const ReviewWorkspaceInviteDTO = z.object({
  status: z.enum(['active', 'rejected']),
  rejectReason: z.string().max(500).optional()
});
