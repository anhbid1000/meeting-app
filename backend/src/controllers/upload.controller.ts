import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

export const uploadFile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                message: "No file uploaded",
            });
            return;
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "meeting-files",
        });

        res.status(200).json({
            message: "Upload success",
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Upload failed",
        });
    }
};