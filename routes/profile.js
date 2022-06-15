const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.post('/changefirstname', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        user.firstName = req.body.name;
        await user.save();

        res.status(200).json({ status: 'success', message: 'First name changed' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/changelastname', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        user.lastName = req.body.name;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Last name changed' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/changeemail', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });

        user.email = req.body.email;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Last name changed' });
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