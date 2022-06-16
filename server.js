const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
module.exports = server;
// const server = require('http').createServer(app);
//module.exports = server;

// Imports
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/client/build'));
app.use(cookieParser());

// DB models
const User = require('./models/User');

// Main route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/build/index.html');
});

app.post('/searchuser', async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) return res.status(200).json({ status: 'error', message: 'User does not exist' });
        res.json({
            status: 'success',
            user,
        });
    } catch(err) {
        console.error(err);
    }
})

// Routes
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);

const signupRoute = require('./routes/signup');
app.use('/signup', signupRoute);

const dashRoute = require('./routes/dashboard');
app.use('/dashboard', dashRoute);

const messagesRoute = require('./routes/messages');
app.use('/messages', messagesRoute);

const searchRoute = require('./routes/search');
app.use('/search', searchRoute);

const profileRoute = require('./routes/profile');
app.use('/profile', profileRoute);

const socketio = require('./socket');
app.use('/socketio', socketio);


server.listen(process.env.PORT || 3001, () => {
    console.log('Server listening on port 3001');
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log('Connected to MongoDB');
});