import mongoose from 'mongoose';

const photosSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: []
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWithGroups: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        }],
        default: []
    }
}, {
    timestamps: true
});

const Photo = mongoose.model('Photos', photosSchema);

export default Photo;