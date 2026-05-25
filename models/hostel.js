const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hostelSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    roomNumber: { type: String, required: true },
    block: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['AC', 'Non-AC'], 
        default: 'Non-AC' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
