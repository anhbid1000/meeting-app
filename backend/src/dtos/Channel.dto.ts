import { z } from 'zod';

// Channel DTOs
export const CreateChannelDTO = z.object({
  name: z
    .string()
    .min(1, 'Channel name is required')
    .max(100, 'Channel name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: z.enum(['public', 'private']).default('public'),
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
});

export const UpdateChannelDTO = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),
  description: z
    .string()
    .max(500)
    .optional(),
  type: z.enum(['public', 'private']).optional(),
  category: z
    .string()
    .max(50)
    .optional(),
  isArchived: z.boolean().optional()
});

// ChannelMember DTOs
export const MuteChannelDTO = z.object({
  isMuted: z.boolean()
});

export const FavoriteChannelDTO = z.object({
  isFavorite: z.boolean()
});

// ChannelJoinRequest DTOs
export const CreateChannelJoinRequestDTO = z.object({
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional()
});

export const RejectChannelJoinRequestDTO = z.object({
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional()
});

export type CreateChannelInput = z.infer<typeof CreateChannelDTO>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelDTO>;
export type MuteChannelInput = z.infer<typeof MuteChannelDTO>;
export type FavoriteChannelInput = z.infer<typeof FavoriteChannelDTO>;
export type CreateChannelJoinRequestInput = z.infer<typeof CreateChannelJoinRequestDTO>;
export type RejectChannelJoinRequestInput = z.infer<typeof RejectChannelJoinRequestDTO>;
