import { Request, Response, NextFunction } from 'express';
import * as fileAssetService from '../services/FileAsset.service';
import { AppError } from '../utils/AppError';

export const listWorkspaceFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const workspaceId = String(req.params.workspaceId || '');
    const result = await fileAssetService.listWorkspaceFiles(workspaceId, userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    if (!req.file) {
      throw new AppError('File upload là bắt buộc', 400, 'FILE_REQUIRED');
    }

    const workspaceId = String(req.params.workspaceId || '');
    const channelId = String(req.body.channelId || '');

    const result = await fileAssetService.uploadWorkspaceFile({
      workspaceId,
      channelId,
      userId,
      appRole: req.user?.role,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: 'Upload file thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// const safe = (p: any) => (Array.isArray(p) ? p[0] : p);
// const CLOUDINARY_HOST = "res.cloudinary.com";

// const resolveProxyParams = (req: Request) => {
//   const url = String(safe(req.query.url) || "").trim();
//   const fileName = String(safe(req.query.fileName) || "download").trim();
//   const mimeType = String(safe(req.query.mimeType) || "").trim();

//   if (!url) {
//     throw Object.assign(new Error("url is required"), { status: 400 });
//   }

//   let parsed: URL;
//   try {
//     parsed = new URL(url);
//   } catch {
//     throw Object.assign(new Error("Invalid file url"), { status: 400 });
//   }

//   if (parsed.hostname !== CLOUDINARY_HOST) {
//     throw Object.assign(new Error("Unsupported file host"), { status: 400 });
//   }

//   const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
//   if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
//     throw Object.assign(new Error("Unsupported Cloudinary asset"), {
//       status: 400,
//     });
//   }

//   return {
//     url: parsed.toString(),
//     fileName: fileName || "download",
//     mimeType,
//   };
// };

// const pipeRemoteFile = async (
//   res: Response,
//   params: {
//     url: string;
//     fileName: string;
//     mimeType?: string;
//     disposition: "inline" | "attachment";
//   },
// ) => {
//   const primaryUrl =
//     params.mimeType === "application/pdf"
//       ? FileAssetService.buildSignedPdfUrl({
//           url: params.url,
//           fileName: params.fileName,
//           disposition: params.disposition,
//         })
//       : params.url;

//   let remote = await fetch(primaryUrl);
//   if (!remote.ok && params.mimeType === "application/pdf") {
//     const fallbackUrl = FileAssetService.buildSignedPdfUrl({
//       url: params.url,
//       fileName: params.fileName,
//       disposition: params.disposition,
//     });
//     remote = await fetch(fallbackUrl);
//   }

//   if (!remote.ok) {
//     return res
//       .status(remote.status)
//       .json({ message: `Cloudinary returned ${remote.status}` });
//   }

//   const arrayBuffer = await remote.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const contentType =
//     params.mimeType ||
//     remote.headers.get("content-type") ||
//     "application/octet-stream";
//   const encodedFileName = encodeURIComponent(params.fileName);

//   res.setHeader("Content-Type", contentType);
//   res.setHeader(
//     "Content-Disposition",
//     `${params.disposition}; filename*=UTF-8''${encodedFileName}`,
//   );
//   res.setHeader("Cache-Control", "private, max-age=300");

//   return res.status(200).send(buffer);
// };

// export const createUploadSignature = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const userId = (req as any).user.id;
//     const { channelId, fileName, mimeType } = req.body;

//     const result = await FileAssetService.createUploadSignature({
//       userId,
//       channelId,
//       fileName,
//       mimeType,
//     });

//     return res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     next(error);
//   }
// };

export const getWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const file = await fileAssetService.getWorkspaceFile(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const getChannelFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { channelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await fileAssetService.getChannelFiles({
      userId,
      channelId: String(channelId),
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getChannelMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { channelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await fileAssetService.getChannelMedia({
      userId,
      channelId: String(channelId),
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getChannelLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { channelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await fileAssetService.getChannelLinks({
      userId,
      channelId: String(channelId),
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const downloadUrl = await fileAssetService.getSignedDownloadUrl(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      data: { downloadUrl },
    });
  } catch (error) {
    next(error);
  }
};

// export const getChannelFiles = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const userId = (req as any).user.id;
//     const channelId = safe(req.params.channelId);
//     const page = req.query.page ? Number(safe(req.query.page)) : 1;
//     const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

//     const result = await FileAssetService.getChannelFiles({
//       userId,
//       channelId,
//       page,
//       limit,
//     });

//     return res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     next(error);
//   }
// };

export const deleteWorkspaceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
    }

    const { fileId } = req.params;
    const result = await fileAssetService.deleteWorkspaceFile(String(fileId), userId, req.user?.role);

    return res.status(200).json({
      success: true,
      message: 'Xoá file thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
// export const getChannelMedia = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const userId = (req as any).user.id;
//     const channelId = safe(req.params.channelId);
//     const page = req.query.page ? Number(safe(req.query.page)) : 1;
//     const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

//     const result = await FileAssetService.getChannelMedia({
//       userId,
//       channelId,
//       page,
//       limit,
//     });

//     return res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     next(error);
//   }
// };

// export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       throw new AppError('Cần đăng nhập để thực hiện thao tác này', 401, 'AUTH_REQUIRED');
//     }

//     const { fileId } = req.params;
//     const signedUrl = await fileAssetService.getSignedDownloadUrl(String(fileId), userId, req.user?.role);

//     return res.status(200).json({
//       success: true,
//       data: { downloadUrl: signedUrl },
// export const getChannelLinks = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const userId = (req as any).user.id;
//     const channelId = safe(req.params.channelId);
//     const page = req.query.page ? Number(safe(req.query.page)) : 1;
//     const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

//     const result = await FileAssetService.getChannelLinks({
//       userId,
//       channelId,
//       page,
//       limit,
//     });

//     return res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     next(error);
//   }
// };

// export const openFileAsset = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const params = resolveProxyParams(req);
//     return await pipeRemoteFile(res, {
//       ...params,
//       disposition: "inline",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const downloadFileAsset = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const params = resolveProxyParams(req);
//     return await pipeRemoteFile(res, {
//       ...params,
//       disposition: "attachment",
//     });
//   } catch (error) {
//     next(error);
//   }
// };
