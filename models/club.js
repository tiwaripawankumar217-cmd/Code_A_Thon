const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    president: { type: Schema.Types.ObjectId, ref: 'Student' },
    members: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
