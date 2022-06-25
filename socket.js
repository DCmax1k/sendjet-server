const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

const User = require('./models/User');
const Conversation = require('./models/Conversation');

let usersOnline = []; // Array of user objects with {socketID, userID, conversationRoom: conversationID}
let rooms = {}; // Object that has each conversation id as a key, and an array of user ids in the room online currently

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinUserRoom', user => {
        socket.join(user._id);

        const userTest = usersOnline.find(userOnline => userOnline.userID === user._id);
        if (!userTest) usersOnline.push({ socketID: socket.id, userID: user._id, username: user.username });
        
        io.emit('currentlyOnline', usersOnline);

    });

    socket.on('updateUser', async (preuser) => {
        const user = await User.findById(preuser._id);
        updateUser(user);
    });

    socket.on('adduser', ({user, adding}) => {
        io.to(adding._id).emit('adduser', user);
    });


    socket.on('unadduser', ({user, unadding}) => {
        io.to(unadding._id).emit('unadduser', user);
    });

    socket.on('acceptfriendrequest', ({user, friend, convoID}) => {
        io.to(friend._id).emit('acceptfriendrequest', {user, convoID});
    });

    socket.on('declinefriendrequest', ({user, friend}) => {
        io.to(friend._id).emit('declinefriendrequest', user);
    });

    socket.on('sendMessage', async ({conversationID, message, members}) => {
        members.forEach(member => {
            if (member === message.sentBy) return;
            io.to(member).emit('sendMessage', { conversationID, message });
            if (!usersOnline.map(userOnline => userOnline.userID).includes(member)) {
                // Send member push notification
            }
        });
        // Update in db
        const conversation = await Conversation.findById(conversationID);
        conversation.messages.push(message);
        conversation.dateActive = Date.now();
        await conversation.save();
    });

    socket.on('addConversation', ({convoData, userID}) => {
        convoData.members.forEach((member) => {
            if (member._id === userID) return;
            io.to(member._id).emit('addConversation', convoData);
        })
    });

    socket.on('joinConversationRoom', ({conversationID, userID, members}) => {
        if (!rooms[conversationID]) rooms[conversationID] = [userID];
        else if (!rooms[conversationID].includes(userID)) rooms[conversationID].push(userID);
        members.forEach(member => {
            io.to(member._id).emit('joinConversationRoom', { conversationID, userID, inChatUsers: rooms[conversationID] });
        });
    });

    socket.on('leaveConversation', ({conversationID, userID, members}) => {
        if (!rooms[conversationID]) return;
        if (rooms[conversationID].length === 1 && rooms[conversationID][0] === userID) delete rooms[conversationID];
        else rooms[conversationID] = rooms[conversationID].filter(user => user !== userID);
        members.forEach(member => {
            if (member._id === userID) return;
            io.to(member._id).emit('leaveConversation', { conversationID, userID });
        });
    });

    socket.on('isTyping', ({conversationID, userID, text}) => {
        const members = rooms[conversationID].filter(user => user !== userID);
        members.forEach(member => {
            io.to(member).emit('isTyping', {conversationID, userID, text});
        });

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
    const friendsThatAreOnline = user.friends.map(friend => {
        if (usersOnline.map(userOnline => userOnline.userID).includes(friend)) {
            return friend;
        }
    });
    friendsThatAreOnline.forEach(friend => {
        io.to(friend).emit('updateUser', user);
    });
}

async function setLastOnline(userID) {

    const user = await User.findByIdAndUpdate(userID, { lastOnline: Date.now() });
    console.log('updating ', user);
    updateUser(user);
}



module.exports = router;