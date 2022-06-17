const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

const User = require('./models/User');

let usersOnline = []; // Array of user objects with {socketID, userID, conversationRoom: conversationID}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinUserRoom', user => {
        console.log('joining room ', user);
        socket.join(user._id);

        const userTest = usersOnline.find(userOnline => userOnline.userID === user._id);
        if (!userTest) usersOnline.push({ socketID: socket.id, userID: user._id, username: user.username });
        
        io.emit('currentlyOnline', usersOnline);

    });

    socket.on('updateUser', (user) => {
        updateUser(user);
    });




    socket.on('disconnect', () => {
        console.log(socket.id + ' user disconnected');

        const user = usersOnline.find(user => user.socketID === socket.id);
        if (user) {
            usersOnline = usersOnline.filter(u => u.userID !== user.userID);
            io.emit('currentlyOnline', usersOnline);

            setLastOnline(user.userID);
        }
    });
});

// FUNCTIONS
function updateUser(user) {
    console.log('userfriends ', user.friends);
    console.log('usersOnline ', usersOnline);
    console.log('map ', usersOnline.map(userOnline => userOnline.userID));
    const friendsThatAreOnline = user.friends.map(friend => {
        if (usersOnline.map(userOnline => userOnline.userID).includes(friend._id)) {
            return friend;
        }
    });
    console.log('friends that are online', friendsThatAreOnline);
    friendsThatAreOnline.forEach(friend => {
        io.to(friend._id).emit('updateUser', user);
    });
}

async function setLastOnline(userID) {

    const user = await User.findByIdAndUpdate(userID, { lastOnline: Date.now() });
    console.log('updating ', user);
    updateUser(user);
}



module.exports = router;