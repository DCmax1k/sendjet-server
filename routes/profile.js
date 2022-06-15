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

router.post('/changeprefix', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        if (!user.premium) return res.status(200).json({ status: 'error', message: 'You must be a premium user to change your prefix' });

        user.prefix.title = req.body.prefix;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Prefix changed' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/changeusername', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        if (!user.premium) return res.status(200).json({ status: 'error', message: 'You must be a premium user to change your username' });

        user.username = req.body.username;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Username changed' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/changeprefixcolor', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        if (!user.premium) return res.status(200).json({ status: 'error', message: 'You must be a premium user to change your prefix color' });

        user.prefix.color = req.body.color;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Prefix color changed' });
    } catch(err) {
        console.error(err);
    }
});

router.post('/changeusernamecolor', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        if (!user.premium) return res.status(200).json({ status: 'error', message: 'You must be a premium user to change your username color' });

        user.usernameColor = req.body.color;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Username color changed' });
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