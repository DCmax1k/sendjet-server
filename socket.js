const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

const User = require('./models/User');

let usersOnline = []; // Array of user objects with {socketID, userID, conversationRoom: conversationID}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinUserRoom', ({ user }) => {
        socket.join(user._id);

        const userTest = usersOnline.find(userOnline => userOnline.userID === user._id);
        if (!userTest) usersOnline.push({ socketID: socket.id, userID: user._id, username: user.username });
        
        io.emit('currentlyOnline', usersOnline);

    });

    socket.on('updateUser', (user) => {
        updateUser(user);
    });




    socket.on('disconnect', () => {
        console.log('user disconnected');

        const user = usersOnline.find(user => user.socketID === socket.id);
        if (user) usersOnline = usersOnline.filter(u => u.userID !== user.userID);
        setLastOnline(user.userID);
        io.emit('currentlyOnline', usersOnline);
    });
});

// FUNCTIONS
function updateUser(user) {
    const friends = user.friends;
    const friendsThatAreOnline = [];
    friends.forEach(friend => {
        const friendOnline = usersOnline.find(user => user.userID === friend._id);
        if (friendOnline) friendsThatAreOnline.push(friend);
    });
    friendsThatAreOnline.forEach(friend => {
        io.to(friend._id).emit('updateUser', user);
    });
}

function setLastOnline(userID) {
    User.findById(userID, (err, user) => {
        if (err) console.log(err);
        user.lastOnline = Date.now();
        user.save();

        updateUser(user);
    });
}



module.exports = router;