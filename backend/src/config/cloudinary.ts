import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../utils/AppError";

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
    throw new AppError("Thiếu CLOUDINARY_URL trong biến môi trường", 500, "CLOUDINARY_URL_MISSING");
}

cloudinary.config({
    cloudinary_url: cloudinaryUrl,
});

export default cloudinary;


