const mongoose = require('mongoose');

// DB user
const ConvoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subTitle: {
        type: String,
        required: true,
    },
    members: {
        type: [String],
        required: true,
    },
    messages: {
        type: [Object],
    },
    
});

module.exports = mongoose.model('Conversation', ConvoSchema);