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
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        const conversations = await Promise.all(user.conversations.map(async convo => {
            let pre = await Conversation.findById(convo);
            const conversation = {
                _id: pre._id,
                title: pre.title,
                subTitle: pre.subTitle,
                members: pre.members,
                messages: pre.messages,
            }
            const members = await Promise.all(conversation.members.map(async member => {
                const mem = await User.findById(member);
                return {
                    _id: mem._id,
                    username: mem.username,
                    firstName: mem.firstName,
                    lastName: mem.lastName,
                    profilePicture: mem.profilePicture,
                    rank: mem.rank,
                    verified: mem.verified,
                    prefix: mem.prefix,
                }
            }));
            conversation.members = members;
            console.log(conversation.members);
            return conversation;
        }));
        const friends = await Promise.all(user.friends.map(async friend => {
            return await User.findById(friend);
        }));

        const jwt_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('auth-token', jwt_token, { httpOnly: true, expires: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000) });
        res.json({
            status: 'success',
            user,
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

