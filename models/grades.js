const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
    semester: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);
