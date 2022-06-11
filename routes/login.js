const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('../models/User');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(200).json({ status: 'User does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ status: 'Incorrect password' });
        }
        const jwt_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('auth-token', jwt_token, { httpOnly: true, expires: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000) }).json({ status: 'success' });

    } catch(err) {
        console.error(err);
    }
});

router.post('/logout', authToken, async (req, res) => {
    try {
        res.cookie('auth-token', '', { expires: new Date(0) }).json({ status: 'success' });
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