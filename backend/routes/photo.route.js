import express from 'express';
import {
    getPhotos,
    createPhoto,
    updatePhoto,
    deletePhoto,
    checkDuplicates
} from '../controllers/photo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', protect, getPhotos);
router.post('/', protect, upload.array('photos'), createPhoto);
router.put('/:photo_id', protect, updatePhoto);
router.delete('/:photoId', protect, deletePhoto);
router.post('/check-duplicates', protect, checkDuplicates);

export default router;
