import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public/photos');
        await fs.ensureDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Zachowaj oryginalną nazwę pliku
        const originalName = file.originalname;
        // Zabezpieczenie przed duplikatami - dodaj timestamp jeśli plik istnieje
        const finalName = fs.existsSync(path.join(process.cwd(), 'public/photos', originalName))
            ? `${Date.now()}-${originalName}`
            : originalName;
        cb(null, finalName);
    }
});

export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    }
}).array('photos');

export const removeUploadedFile = async (filename) => {
    try {
        const filePath = path.join(process.cwd(), 'public/photos', filename);
        await fs.unlink(filePath);
    } catch (err) {
        console.error('Error removing file:', err);
        throw err;
    }
};

export const generatePhotoData = (file) => {
    if (!file) throw new Error('No file provided');

    return {
        filename: file.filename,
        path: `/photos/${file.filename}`,
        tags: []
    };
};