import mongoose from 'mongoose';

const photosSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        default: "/photos",
        required: true,
    },
    tags: {
        type: Array
    }
}, {
    timestamps: true
})

const Photo = mongoose.model('Photos', photosSchema);

export default Photo;