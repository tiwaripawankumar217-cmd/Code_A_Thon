const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Late'], 
        required: true 
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
