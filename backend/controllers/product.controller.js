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

export const createPhoto = async(req, res) => {
    const photo = req.body;

    if(!photo.filename){
        return res.status(400).json({ success: false, message: 'please provide all fields' });
    }

    const newPhoto = new Photo(photo)

    try {
        await newPhoto.save();
        res.status(201).json({success: true, data: newPhoto});
    } catch(err) {
        console.log("Error in creating new photo", err.message);
        res.status(500).json({success: false, message: 'server error'});
    }
}

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
    try {
        await Photo.findByIdAndDelete(photoId);
        res.status(200).json({success: true, message: 'Photo deleted'});
    } catch(err) {
        console.log("Error in deleting new photo", err.message);
        res.status(404).json({success: false, message: 'Photo not found'});
    }
}