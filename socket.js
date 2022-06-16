const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

const User = require('./models/User');

let usersOnline = []; // Array of user objects with {socketID, userID, conversationRoom: conversationID}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinUserRoom', ({ id }) => {
        socket.join(id);

        const user = usersOnline.find(user => user.userID === id);
        if (!user) usersOnline.push({ socketID: socket.id, userID: id });
        
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
    const friends = user.friends.map(friend => friend._id);
    const friendsThatAreOnline = [];
    friends.forEach(friend_id => {
        const friendOnline = usersOnline.find(user => user.userID === friend_id);
        if (friendOnline) friendsThatAreOnline.push(friend_id);
    });
    friendsThatAreOnline.forEach(friend => {
        io.to(friend).emit('updateUser', user);
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