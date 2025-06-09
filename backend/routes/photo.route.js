import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    checkDuplicates,
    createPhoto,
    deletePhoto,
    getPhotos,
    updatePhoto,
} from '../controllers/photo.controller.js';
import { uploadMiddleware } from '../utils/fileStorage.js';

const router = express.Router();

router.use(protect);

router.get('/', getPhotos);
router.post('/', uploadMiddleware, createPhoto);
router.post('/check-duplicates', checkDuplicates);
router.put('/:photo_id', updatePhoto);
router.delete('/:photoId', deletePhoto);

export default router;
