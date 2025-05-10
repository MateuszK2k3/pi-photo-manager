import express from 'express';
import {createPhoto, deletePhoto, getPhotos, updatePhoto} from "../controllers/product.controller.js";

const router = express.Router();

export default router;

router.get('/', getPhotos)
router.post('/', createPhoto)
router.put('/:photo_id', updatePhoto)
router.delete('/:photoId', deletePhoto)

