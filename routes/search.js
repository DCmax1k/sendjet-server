const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.post('/', authToken, async (req, res) => {
    try {
        const query = req.body.query;

        const allUsers = await User.find();
        const searchUsername = allUsers.filter(user => user.username.toLowerCase().includes(query.toLowerCase())).filter(user => user._id != req.userId);

        res.json({
            status: 'success',
            users: searchUsername,
        });

    } catch(err) {
        console.error(err);
    }
});

router.post('/adduser', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        if (user.friends.includes(req.body.id)) return res.status(200).json({ status: 'error', message: 'User is already your friend' });

        const userToAdd = await User.findById(req.body.id);
        if (!userToAdd) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        user.addRequests.push(userToAdd._id);
        await user.save();

        userToAdd.friendRequests.push(user._id);
        await userToAdd.save();

        res.status(200).json({ status: 'success', message: 'Friend request sent' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/unadduser', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        let friendStatus = null;
        if (user.friends.includes(req.body.id)) friendStatus = 'friends';
        else if (user.addRequests.includes(req.body.id)) friendStatus = 'added';

        const userToRemove = await User.findById(req.body.id);
        if (!userToRemove) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        if (friendStatus === 'friends') {
            user.friends.pull(userToRemove._id);
            userToRemove.friends.pull(user._id);
        } else if (friendStatus === 'added') {
            user.addRequests.pull(userToRemove._id);
            userToRemove.friendRequests.pull(user._id);
        }
        await user.save();
        await userToRemove.save();

        res.status(200).json({ status: 'success', message: 'Friend removed' });
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

