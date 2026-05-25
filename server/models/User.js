const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false,
        default: ''
    },
    lastName: {
        type: String,
        required: false,
        default: ''
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    overallHealthScore: {
        type: Number,
        default: 100
    }
}, { timestamps: true });

// Passport-local-mongoose will automatically add username (which we'll use for email), hash, and salt fields
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, { usernameField: 'username' });

module.exports = mongoose.model('User', userSchema);
