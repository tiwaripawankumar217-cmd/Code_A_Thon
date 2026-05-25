const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    adminId: { type: String, required: true, unique: true }
}, { timestamps: true });

// Using email as the username field for authentication
adminSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('Admin', adminSchema);
