const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/User');

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
        res.json({
            status: 'success',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                warnings: user.warnings,
                rank: user.rank,
                emailVerified: user.emailVerified,
                dateJoined: user.dateJoined,
            },

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

