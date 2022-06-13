const mongoose = require('mongoose');

// DB user
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    dateJoined: {
        type: Date,
        default: Date.now,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: Number,
    },
    lastOnline: {
        type: Date,
        default: Date.now,

    },
    profilePicture: {
        type: String,
        default: '../assets/profilePlaceholder.png',
    },
    rank: {
        type: String,
        default: 'user',
    },
    prefix: {
        type: Object,
        default: {
            title: '',
            color: '#a4a4a4',
        },
    },
    verified: {
        type: Boolean,
        default: false,
    },
    warnings: {
        type: [String],
        default: [],
    },
    userPIN: {
        type: Number,
        default: null,
        unique: true,
    },
    friendRequests: {
        type: [String],
        default: [],
    },
    addRequests: {
        type: [String],
        default: [],
    },
    friends: {
        type: [String],
        default: [],
    },
    blockedUsers: {
        type: [String],
        default: [],
    },
    blockedBy: {
        type: [String],
        default: [],
    },
    conversations: {
        type: [String],
        default: [],

    },
    score: {
        type: Number,
        default: 0,
        
    }


});

module.exports = mongoose.model('User', UserSchema);