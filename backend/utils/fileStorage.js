import path from 'path';
import fs from 'fs-extra';

export const removeUploadedFile = async (filename) => {
    try {
        const filePath = path.join(process.cwd(), 'public/photos', filename);
        await fs.unlink(filePath);
    } catch (err) {
        console.error('Error removing file:', err);
        throw err;
    }
};
