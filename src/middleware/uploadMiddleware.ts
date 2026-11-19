
import multer from "multer";
import path from "path";
import fs from "fs";
import type { RequestHandler } from "express";
const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "payment-photos"
);

// Create directory automatically
fs.mkdirSync(uploadDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },

    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        callback(null, uniqueName);
    }
});

// Validate image type
const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    callback
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        callback(new Error("Only JPEG, PNG and WebP images are allowed."));
        return;
    }

    callback(null, true);
};

// Configure upload
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

const handleUpload = upload.single("paymentPhoto");

export const paymentPhotoUpload: RequestHandler = (
    req,
    res,
    next
) => {
    handleUpload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            const status =
                error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

            res.status(status).json({
                message:
                    error.code === "LIMIT_FILE_SIZE"
                        ? "Payment photo must not exceed 5 MB."
                        : "Invalid payment photo upload."
            });

            return;
        }

        if (error) {
            res.status(400).json({
                message: error.message
            });

            return;
        }

        next();
    });
};
