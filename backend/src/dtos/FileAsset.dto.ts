import { z } from "zod";

export const CreateUploadSignatureDTO = z.object({
  channelId: z.string().trim().min(1, "channelId is required"),
  fileName: z.string().trim().min(1, "fileName is required"),
  mimeType: z.string().trim().min(1, "mimeType is required"),
});

export type CreateUploadSignatureInput = z.infer<
  typeof CreateUploadSignatureDTO
>;
