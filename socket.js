const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

const User = require('./models/User');

const usersOnline = []; // Array of user objects with {socketID, userID, conversationRoom: conversationID}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinUserRoom', ({ id }) => {
        socket.join(id);

        const user = usersOnline.find(user => user.userID === id);
        if (!user) usersOnline.push({ socketID: socket.id, userID: id });
        
        io.emit('currentlyOnline', usersOnline);

    });








    socket.on('disconnect', () => {
        console.log('user disconnected');

        const user = usersOnline.find(user => user.socketID === socket.id);
        if (user) usersOnline.splice(usersOnline.map(guy => guy.userID).indexOf(user.userID), 1);
        const dbUser = User.findByIdAndUpdate(user.userID, { lastOnline: Date.now() });
        io.emit('currentlyOnline', usersOnline);
    });
})

module.exports = router;