import Photo from "../models/product.model.js";
import mongoose from "mongoose";

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
    const payload = req.body;

    if (Array.isArray(payload)) {
        const invalid = payload.some(photo => !photo.filename);
        if (invalid) {
            return res.status(400).json({ success: false, message: 'Every photo must have a filename' });
        }

        try {
            const newPhotos = await Photo.insertMany(payload);
            return res.status(201).json({ success: true, data: newPhotos });
        } catch (err) {
            console.error("Error inserting multiple photos", err.message);
            return res.status(500).json({ success: false, message: 'Server error while saving multiple photos' });
        }
    }

    if (!payload.filename) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const newPhoto = new Photo(payload);

    try {
        await newPhoto.save();
        res.status(201).json({ success: true, data: newPhoto });
    } catch (err) {
        console.error("Error inserting single photo", err.message);
        res.status(500).json({ success: false, message: 'Server error while saving single photo' });
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