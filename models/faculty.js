const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const facultySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true }
}, { timestamps: true });

// Using email as the username field for authentication
facultySchema.plugin(passportLocalMongoose.default || passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('Faculty', facultySchema);
