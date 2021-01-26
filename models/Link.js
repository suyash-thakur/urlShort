var mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
    shortURL: { type: String, required: true, unique: true },
    originalURL: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    dateCreated: { type: Date, required: true, default: Date.now },
    expireAt: { type: Date, default: undefined },
    author: {type: mongoose.Schema.Types.ObjectID, ref: 'User', required: true}
    
});
linkSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Link', linkSchema );