const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    } catch(err) {
        console.error(err);
    }
});

router.post('/', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { _doc: modifiedUser} = {...user};
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        const conversations = await Conversation.find({ _id: { $in: [user.conversations] } });
        await Promise.all(conversations.map(async convo => {
            const {_doc: newConvo} = {...convo};
            const members = await User.find({ _id: { $in: newConvo.members } });
            newConvo.members = members;
            return newConvo;
        }));

        const friends = await User.find({ _id: { $in: user.friends } });
        modifiedUser.friends = friends;

        const addRequests = await User.find({ _id: { $in: user.addRequests } });
        modifiedUser.addRequests = addRequests;

        const friendRequests = await User.find({ _id: { $in: user.friendRequests } });
        modifiedUser.friendRequests = friendRequests;

        const jwt_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('auth-token', jwt_token, { httpOnly: true, expires: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000) });
        res.json({
            status: 'success',
            user: modifiedUser,
            conversations,
            friends,

        });
    } catch(err) {
        console.error(err);
    }
});

function authToken(req, res, next) {
    const token = req.cookies['auth-token'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.userId;
        next();
    })
}

module.exports = router;

