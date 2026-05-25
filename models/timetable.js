const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodSchema = new Schema({
    subject: { type: String, required: true },
    time: { type: String, required: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    room: { type: String }
}, { _id: false });

const timetableSchema = new Schema({
    department: { type: String, required: true },
    semester: { type: String, required: true },
    day: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true 
    },
    schedule: [periodSchema]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
