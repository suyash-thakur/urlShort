var mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isGuest: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', UserSchema );