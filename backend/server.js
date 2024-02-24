const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors({ origin: '*' }));

const users = new Map();
let messages = [];

io.on('connection', (socket) => {
    console.log(`A user connected: socket.id = ${socket.id}`);

    socket.on('setUsername', (username) => {
        // Check if the username is in use or was used by a disconnected user
        if (!isUsernameTaken(username)) {
            users.set(socket.id, username);
            console.log(`${username} is connected. socket.id = ${socket.id}`);
            socket.emit('usernameSet', true);
            // emit the new messages
            socket.emit('updateMessages', messages);
            io.emit('updateUserCount', users.size);
        } else {
            socket.emit('usernameSet', false);
        }
    });

    socket.on('message', (message) => {
        const username = users.get(socket.id);
        const messageId = generateMessageId();
        const messageObject = { id: messageId, username, text: message, userId: socket.id };
        messages.push(messageObject);
        console.log(`${username}: ${message}`);
        io.emit('message', messageObject);
    });

    socket.on('deleteMessage', (data) => {
        const { messageId, userId } = data;
        const messageIndex = messages.findIndex((msg) => msg.id === messageId && msg.userId === userId);
        if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
            io.emit('updateMessages', messages);
            io.emit('messageDeleted', messageId);
        }
    });


    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        console.log(`User ${username} is disconnected.`);
        users.delete(socket.id);

        // Remove disconnected user's messages
        messages = messages.filter((message) => message.userId !== socket.id);

        io.emit('updateUserCount', users.size);
    });
});

function generateMessageId() {
    const randomstring = Math.random().toString(36).substring(2, 11);
    return randomstring;
}

function isUsernameTaken(username) {
    return Array.from(users.values()).includes(username);
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});