import Photo from "../models/photo.model.js";
import mongoose from "mongoose";
import {removeUploadedFile} from "../utils/fileStorage.js";
import fs from "fs-extra";
import path from "path";

export const getPhotos = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const photos = await Photo.find({ owner: userId });
        res.status(200).json({ success: true, data: photos });
    } catch (err) {
        console.error("Error on getting photos:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const createPhoto = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: user ID missing in token'
            });
        }

        const photos = await Promise.all(req.files.map(async file => {
            const relPath = `/photos/${req.user.login}`;
            const photoData = {
                filename: file.originalname,
                path:     relPath,
                tags:     JSON.parse(req.body.tags || '[]'),
                owner:    userId
            };

            const newPhoto = new Photo(photoData);
            await newPhoto.save();
            return newPhoto;
        }));

        res.status(201).json({ success: true, data: photos });

    } catch (err) {
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

export const updatePhoto = async (req, res) => {
    const { photo_id } = req.params;
    // Odbieramy od frontendu pole 'filename' (bez rozszerzenia) i 'tags'
    const { filename: newNameWithoutExt, tags: newTags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(photo_id)) {
        return res.status(400).json({ success: false, message: "Invalid photo ID" });
    }

    try {
        const photo = await Photo.findById(photo_id);
        if (!photo) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }

        // Ścieżka do folderu z obrazami
        const uploadDir = path.join(process.cwd(), photo.path.replace(/^\/photos\//, 'public/photos/'));
        const oldFilename = photo.filename;                // np. "oldName.png"
        const oldPath = path.join(uploadDir, photo.filename);

        // Pobieramy rozszerzenie, np. ".png"
        const ext = path.extname(oldFilename);
        const newFilename = `${newNameWithoutExt}${ext}`;   // "newName.png"
        const newPath = path.join(uploadDir, photo.filename);

        // Jeśli nazwa pliku się zmieniła, przenosimy go (rename)
        if (newFilename !== oldFilename) {
            // Sprawdź, czy stary plik faktycznie istnieje na dysku
            if (!(await fs.pathExists(oldPath))) {
                return res
                    .status(404)
                    .json({ success: false, message: "Original file not found on disk" });
            }
            // Jeżeli nowy plik o tej samej nazwie już istnieje, zwracamy błąd
            if (await fs.pathExists(newPath)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot rename: file "${newFilename}" already exists.`,
                });
            }
            // Próba przeniesienia
            try {
                await fs.move(oldPath, newPath);
            } catch (fsErr) {
                console.error("Error renaming file on disk:", fsErr);
                return res.status(500).json({
                    success: false,
                    message: "Server error while renaming file",
                });
            }
            photo.filename = newFilename;
        }

        // Zaktualizuj pola w DB: filename (jeśli zmieniło się) i tags
        photo.tags = Array.isArray(newTags) ? newTags : [];
        const updatedPhoto = await photo.save();

        return res.status(200).json({ success: true, data: updatedPhoto });
    } catch (err) {
        console.error("Error in updatePhoto controller:", err);
        return res
            .status(500)
            .json({ success: false, message: "Server error while updating photo" });
    }
};

export const deletePhoto = async (req, res) => {
    const { photoId } = req.params;

    // Najpierw sprawdźmy poprawność ID
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid photo ID",
        });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({
                success: false,
                message: "Photo not found in database",
            });
        }

        // 1) Usuń plik z dysku
        const uploadDir = path.join(process.cwd(), photo.path.replace(/^\/photos\//, 'public/photos/'));
        const filePath = path.join(uploadDir, photo.filename);

        // Sprawdź, czy plik istnieje
        if (await fs.pathExists(filePath)) {
            try {
                await fs.unlink(filePath);
            } catch (fsErr) {
                console.error("Error deleting file from disk:", fsErr);
                return res.status(500).json({
                    success: false,
                    message: "Server error while deleting file",
                });
            }
        } else {
            // Jeśli pliku już nie ma, to i tak usuwamy wpis z bazy, ale logujemy
            console.warn("File not found on disk:", filePath);
        }

        // 2) Usuń dokument z bazy
        await Photo.findByIdAndDelete(photoId);

        return res.status(200).json({
            success: true,
            message: "Photo deleted successfully",
        });
    } catch (err) {
        console.error("Error in deletePhoto controller:", err);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting photo",
        });
    }
};

export const checkDuplicates = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const filenames = req.body.filenames || JSON.parse(req.body.originalNames || '[]');

        const duplicates = await Photo.find({
            owner: userId,
            filename: { $in: filenames }
        }).select('filename');

        res.json({
            success:    true,
            duplicates: duplicates.map(d => d.filename)
        });
    } catch (err) {
        console.error('Error checking duplicates:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};