const mongoose = require('mongoose');

// DB user
const ConvoSchema = new mongoose.Schema({
    name: {
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

module.exports = mongoose.model('Covnersation', ConvoSchema);