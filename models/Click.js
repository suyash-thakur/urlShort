var mongoose = require('mongoose');

var clickSchema = mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    timeStamp: {type: Date, default: Date.now(), required: true}
});

module.exports = mongoose.model('Click', clickSchema );