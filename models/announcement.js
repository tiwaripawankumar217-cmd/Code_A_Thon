const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, required: true, refPath: 'authorModel' },
    authorModel: { 
        type: String, 
        required: true, 
        enum: ['Faculty', 'Admin'] 
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
