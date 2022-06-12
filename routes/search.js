const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.post('/', authToken, async (req, res) => {
    try {
        const query = req.body.query;

        const searchUsername = await User.find({ $where: function () {
            return /^.*?\b${query}\b.*?$/.test(this.username);
        }  });

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

