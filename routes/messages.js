const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

const sendPushNoti = require("../utils/sendPushNoti");

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
        let convo;
        if (checkConvo && checkConvo.members.length === members.length) {
            res.json({
                status: 'success',
                message: 'Conversation already exists',
                convo: checkConvo,
            });
        } else {
            // Push notification array
            const messages = [];

            // Create db convo
            convo = new Conversation(convoData);
            await convo.save();

            // ADD CONVERSATION TO USERS
            const users = await Promise.all(members.map(async member => {
                return await User.findById(member);
            }))
            users.forEach(u => {
                //if (u._id != user._id) {
                    // If not the user that created the convo, send push noti
                    messages.push({
                        to: u.expoPushToken,
                        sound: 'default',
                        body: "New conversation created by " + user.username + "!",
                        data: {},
                    });
               // }
                u.conversations.push(convo._id);
                u.save();
            });
            
            sendPushNoti(messages);
        }
        res.json({
            status: 'success',
            convo,

        });
    } catch(err) {
        console.error(err);
    }
});

router.post('/pinconversation', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.pinnedConversations.push(req.body.conversationID);
        await user.save();
        res.json({
            status: 'success',
        })
    } catch(err) {
        console.error(err);
    }
});
router.post('/unpinconversation', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.pinnedConversations.splice(user.pinnedConversations.indexOf(req.body.conversationID), 1);
        await user.save();
        res.json({
            status: 'success',
        })
    } catch(err) {
        console.error(err);
    }
});

router.post('/changegroupname', authToken, async (req, res) => {
    try {
        const userID = req.userId;
        const conversation = await Conversation.findById(req.body.conversationID);
        if (!conversation.members.includes(userID)) return res.status(200).json({status: 'error', message: 'User not in group'});
        conversation.title = req.body.newTitle;
        await conversation.save();
        res.status(200).json({status: 'success', message: 'Changed group name'});
    } catch(err) {
        console.error(err);
    }
});

router.post('/leaveconversation', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const conversation = await Conversation.findById(req.conversationID);

        // Remove from user conversations
        user.conversations = user.conversations.filter(convo => convo._id != conversation._id);
        await user.save();

        // Remove from actual conversation
        if (conversation.members.length == 1 && conversation.members[0] == user._id) {
            conversation.members = [];
            conversation.title = "ALL MEMBERS LEFT";
            await conversation.save();
        } else {
            conversation.members = conversation.members.filter(mem => mem._id != user._id);
            await conversation.save();
        }

        res.status(200).json({status: 'success', message: 'Left conversation'});
    } catch(err) {
        console.error(err);
    }
})

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

