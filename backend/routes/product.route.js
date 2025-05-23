import express from 'express';
import {checkDuplicates, createPhoto, deletePhoto, getPhotos, updatePhoto} from "../controllers/product.controller.js";
import {uploadMiddleware} from "../utils/fileStorage.js";

const router = express.Router();

export default router;

router.get('/', getPhotos)
router.post('/', uploadMiddleware, createPhoto);
router.post('/check-duplicates', checkDuplicates)
router.put('/:photo_id', updatePhoto)
router.delete('/:photoId', deletePhoto)
