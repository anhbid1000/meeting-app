import { z } from 'zod';

export const CreateWorkspaceDTO = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    'work',
    'education',
    'community',
    'personal',
    'events',
    'projects',
    'social',
    'gaming',
    'other'
  ]).default('other')
});