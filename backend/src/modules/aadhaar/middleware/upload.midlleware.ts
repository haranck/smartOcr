import multer, { diskStorage } from "multer";
import * as path from "path";
import { ENV } from "../config/env.config";

import * as fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const uploadConfig: multer.Options = {
    storage,
    limits: {
        fileSize: ENV.MAX_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(null, false);
    },
};