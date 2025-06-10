import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const BASE_DIR = path.join(process.cwd(), 'public', 'photos');
fs.ensureDirSync(BASE_DIR);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const login = req.user.login;
        const userDir = path.join(BASE_DIR, login);
        fs.ensureDirSync(userDir);
        cb(null, userDir);
        },
    filename:    (req, file, cb) => cb(null, file.originalname)
});

const fileFilter = (req, file, cb) => {
    // Akceptuj tylko obrazy
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // maksymalnie 5MB
    }
});

export default upload;
