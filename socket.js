const express = require('express');
const router = express.Router();

const server = require('./server');
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('testing', (data) => {
        console.log(data);
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

module.exports = router;