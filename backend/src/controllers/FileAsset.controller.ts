import { Request, Response, NextFunction } from "express";
import { FileAssetService } from "../services/FileAsset.service";

const safe = (p: any) => (Array.isArray(p) ? p[0] : p);
const CLOUDINARY_HOST = "res.cloudinary.com";

const resolveProxyParams = (req: Request) => {
  const url = String(safe(req.query.url) || "").trim();
  const fileName = String(safe(req.query.fileName) || "download").trim();
  const mimeType = String(safe(req.query.mimeType) || "").trim();

  if (!url) {
    throw Object.assign(new Error("url is required"), { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw Object.assign(new Error("Invalid file url"), { status: 400 });
  }

  if (parsed.hostname !== CLOUDINARY_HOST) {
    throw Object.assign(new Error("Unsupported file host"), { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
    throw Object.assign(new Error("Unsupported Cloudinary asset"), {
      status: 400,
    });
  }

  return {
    url: parsed.toString(),
    fileName: fileName || "download",
    mimeType,
  };
};

const pipeRemoteFile = async (
  res: Response,
  params: {
    url: string;
    fileName: string;
    mimeType?: string;
    disposition: "inline" | "attachment";
  },
) => {
  const primaryUrl =
    params.mimeType === "application/pdf"
      ? FileAssetService.buildSignedPdfUrl({
          url: params.url,
          fileName: params.fileName,
          disposition: params.disposition,
        })
      : params.url;

  let remote = await fetch(primaryUrl);
  if (!remote.ok && params.mimeType === "application/pdf") {
    const fallbackUrl = FileAssetService.buildSignedPdfUrl({
      url: params.url,
      fileName: params.fileName,
      disposition: params.disposition,
    });
    remote = await fetch(fallbackUrl);
  }

  if (!remote.ok) {
    return res
      .status(remote.status)
      .json({ message: `Cloudinary returned ${remote.status}` });
  }

  const arrayBuffer = await remote.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    params.mimeType ||
    remote.headers.get("content-type") ||
    "application/octet-stream";
  const encodedFileName = encodeURIComponent(params.fileName);

  res.setHeader("Content-Type", contentType);
  res.setHeader(
    "Content-Disposition",
    `${params.disposition}; filename*=UTF-8''${encodedFileName}`,
  );
  res.setHeader("Cache-Control", "private, max-age=300");

  return res.status(200).send(buffer);
};

export const createUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const { channelId, fileName, mimeType } = req.body;

    const result = await FileAssetService.createUploadSignature({
      userId,
      channelId,
      fileName,
      mimeType,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getChannelFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const page = req.query.page ? Number(safe(req.query.page)) : 1;
    const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

    const result = await FileAssetService.getChannelFiles({
      userId,
      channelId,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getChannelMedia = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const page = req.query.page ? Number(safe(req.query.page)) : 1;
    const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

    const result = await FileAssetService.getChannelMedia({
      userId,
      channelId,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getChannelLinks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const channelId = safe(req.params.channelId);
    const page = req.query.page ? Number(safe(req.query.page)) : 1;
    const limit = req.query.limit ? Number(safe(req.query.limit)) : 20;

    const result = await FileAssetService.getChannelLinks({
      userId,
      channelId,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const openFileAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = resolveProxyParams(req);
    return await pipeRemoteFile(res, {
      ...params,
      disposition: "inline",
    });
  } catch (error) {
    next(error);
  }
};

export const downloadFileAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = resolveProxyParams(req);
    return await pipeRemoteFile(res, {
      ...params,
      disposition: "attachment",
    });
  } catch (error) {
    next(error);
  }
};
