import Photo from "../models/product.model.js";
import mongoose from "mongoose";
import {removeUploadedFile} from "../utils/fileStorage.js";

export const getPhotos = async (req, res) => {
    try {
        const products = await Photo.find({});
        res.status(200).json({success: true, data: products});
    } catch (err) {
        console.error("Error on getting products", err.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const createPhoto = async (req, res) => {
    try {
        // Check for files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Process each file
        const photos = await Promise.all(req.files.map(async file => {
            const photoData = {
                filename: file.filename,
                tags: req.body.tags ? JSON.parse(req.body.tags) : []
            };

            const newPhoto = new Photo(photoData);
            await newPhoto.save();
            return newPhoto;
        }));

        res.status(201).json({ success: true, data: photos });

    } catch (err) {
        // Cleanup uploaded files if error occurs
        if (req.files) {
            await Promise.all(req.files.map(file =>
                removeUploadedFile(file.filename)
            ));
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

export const updatePhoto = async(req, res) => {
    const {photo_id} = req.params;

    const photo = req.body;

    if(!mongoose.Types.ObjectId.isValid(photo_id)){
        return res.status(404).json({success: false, message: 'Invalid ID'});
    }

    try {
        const updatedPhoto = await Photo.findByIdAndUpdate(photo_id, photo, {new:true})
        res.status(200).json({success: true, data: updatedPhoto});
    } catch (err) {
        res.status(500).json({success: false, message: 'Server Error'});
    }
}

export const deletePhoto = async(req, res) => {
    const {photoId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(photo_id)){
        return res.status(404).json({success: false, message: 'Invalid product ID'});
    }

    try {
        await Photo.findByIdAndDelete(photoId);
        res.status(200).json({success: true, message: 'Photo deleted'});
    } catch(err) {
        console.log("Error in deleting new photo", err.message);
        res.status(500).json({success: false, message: 'Server Error'});
    }
}

export const checkDuplicates = async(req, res) => {
    try {
        const { filenames } = req.body;
        const duplicates = await Photo.find({
            filename: { $in: filenames }
        }).select('filename');

        res.json({success: true, duplicates: duplicates.map(d => d.filename)});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}