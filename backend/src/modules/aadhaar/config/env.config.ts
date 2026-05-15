import { config } from "dotenv";

config();

export const ENV = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY || "helloworld",
    OCR_API_URL: process.env.OCR_API_URL || "https://api.ocr.space/parse/image",
};
