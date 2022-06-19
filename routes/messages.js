const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.post('/createconversation', authToken, async (req, res) => {
    try {
        // CREATE CONVERSATION
        const user = await User.findById(req.userId);
        const members = [user._id, ...req.body.members];
        let title = req.body.title;
        let subTitle = req.body.subTitle;
        if (req.body.members.length === 1) {
            const memeber = await User.findById(req.body.members[0]);
            title = memeber.username;
            subTitle = memeber.firstName + ' ' + memeber.lastName;
        }
        const convoData = {
            title,
            subTitle,
            members: members,
            messages: [],
            dateCreated: Date.now(),
            lastSentBy: user._id,
            seenBy: [user._id],
        }
        // Check if convo already exists
        const checkConvo = await Conversation.findOne({ members: { $all: members } });
        if (checkConvo && checkConvo.members.length === members.length) {
            res.json({
                status: 'success',
                message: 'Conversation already exists',
                convo: checkConvo,
            });
        } else {

            const convo = await Conversation.create(convoData);
            await convo.save();

            // ADD CONVERSATION TO USERS
            const users = await Promise.all(members.map(async member => {
                return await User.findById(member);
            }))
            users.forEach(user => {
                user.conversations.push(convo._id);
                user.save();
            });
        }
        res.json({
            status: 'success',
            convo,

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

