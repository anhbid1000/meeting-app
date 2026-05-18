import { z } from 'zod';

export const CreateWorkspaceDTO = z.object({
  name: z.string().min(2, 'Tên workspace phải có ít nhất 2 ký tự').max(100),
  description: z.string().max(500).optional()
});