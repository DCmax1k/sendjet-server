const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);
const {Expo} = require('expo-server-sdk');
let expo = new Expo();

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

        // Group members into a array to push notifications as a chunk
        const pushMessages = [];
        const sender = await User.findById(message.sentBy);

        await Promise.all(members.map(async member => {
            // Send socket message
            if (member === message.sentBy) return;
            io.to(member).emit('sendMessage', { conversationID, message });

            // Get push tokens from db and fill messages array with data
            const user = await User.findById(member);
            if (user.expoPushToken.length > 0) {
                pushMessages.push({
                    to: user.expoPushToken,
                    sound: 'default',
                    body: 'New message from ' + sender.username + '!',
                    data: {},
                }); 
            }
            
        }));

        // Send the push messages as a chunk
        let chunks = expo.chunkPushNotifications(pushMessages);
        let tickets = [];
        (async () => {

            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
                    tickets.push(...ticketChunk);

                } catch (error) {
                    console.error(error);
                }
            }
        })();
        

        // Update in db
        const conversation = await Conversation.findById(conversationID);
        conversation.messages.push(message);
        conversation.dateActive = new Date();
        conversation.seenBy = rooms[conversationID] || [];
        await conversation.save();
    });

    socket.on('messagesEditMessage', async ({conversationID, newMessage, members}) => {
        members.forEach(member => {
            if (member === newMessage.sentBy) return;
            io.to(member).emit('messageEditMessage', { conversationID, newMessage });
        });

        // Update in db
        const conversation = await Conversation.findById(conversationID);
        const allMessages = conversation.messages;
        newMessage.edited = true;
        const oldMessage = allMessages.find(mes => mes.date === newMessage.date);
        const indexOfMessage = allMessages.indexOf(oldMessage);
        allMessages.splice(indexOfMessage,1,newMessage);
        conversation.messages = allMessages;
        conversation.dateActive = new Date();
        conversation.seenBy = rooms[conversationID];
        await conversation.save();
    });

    socket.on('addConversation', ({convoData, userID}) => {
        convoData.members.forEach((member) => {
            if (member._id === userID) return;
            io.to(member._id).emit('addConversation', convoData);
        })
    });

    socket.on('joinConversationRoom', async ({conversationID, userID, members}) => {
        if (!rooms[conversationID]) rooms[conversationID] = [userID];
        else if (!rooms[conversationID].includes(userID)) rooms[conversationID].push(userID);
        members.forEach(member => {
            io.to(member._id).emit('joinConversationRoom', { conversationID, userID, inChatUsers: rooms[conversationID] });
        });
        await Conversation.findByIdAndUpdate(conversationID, { $push: {seenBy: userID}});
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
        //const members = rooms[conversationID].filter(user => user !== userID);
        const members = rooms[conversationID];
        members.forEach(member => {
            io.to(member).emit('isTyping', {conversationID, userID, text});
        });

    });




    socket.on('disconnect', () => {
        console.log(socket.id + ' user disconnected');

        // Update currently online
        const user = usersOnline.find(user => user.socketID === socket.id);
        if (user) {
            usersOnline = usersOnline.filter(u => u.userID !== user.userID);
            io.emit('currentlyOnline', usersOnline);

            setLastOnline(user.userID);
        }

        // Remove from rooms
        const conversationIDS = Object.keys(rooms);
        conversationIDS.forEach(convoID => {
            if (rooms[convoID].includes(user.userID)) {
                rooms[convoID] = rooms[convoID].filter(u => u !== user.userID)
            }
        })
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
    updateUser(user);
}



module.exports = router;