import multer from 'multer';
import { Request } from 'express';
import fs from 'fs';

// ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req: Request, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        // accept only CSV files
        if (file.mimetype.includes('csv') || file.originalname.toLowerCase().endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Clean up function to remove file
export const removeFile = (filePath: string): void => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
