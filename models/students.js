const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const studentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    batch: { type: String, required: true },
    contact: { type: String }
}, { timestamps: true });

// Using email as the username field for authentication
studentSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('Student', studentSchema);
