const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('../models/User');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePass(pass) {
    return pass.length >= 8;
}
function validateUsername(username) {
    return username.length <= 10;
}
pinGeneration = async () => {
    let pin = Math.floor(Math.random() * 9999) + 1000;
    const checkUserPin = await User.findOne({ userPIN: pin, });
    if (checkUserPin) return pinGeneration();
    return pin;
}

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password} = req.body;
        const checkUser = await User.findOne({ username });
        if (checkUser) {
            return res.status(200).json({status: 'Username already exists'});
        }
        if (!validateEmail(email)) return res.status(200).json({status: 'Please enter a valid email'});
        if (!validatePass(password)) return res.status(200).json({status: 'Password must be at least 8 characters long'});
        if (!validateUsername(username)) return res.status(200).json({status: 'Username must be 10 characters or less'});

        let userPIN = await pinGeneration();

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            userPIN: userPIN,
        });
        await user.save();

        const jwt_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('auth-token', jwt_token, { httpOnly: true, expires: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000) }).json({ status: 'success' });

    } catch(err) {
        console.error(err);
    }
});

module.exports = router;