// server.js - Node.js Backend with Express and Socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = 5000;

// Store connected users
const users = {};
let messageHistory = [];

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // User joins the chat
  socket.on('userJoin', (data) => {
    const { username } = data;
    users[socket.id] = {
      id: socket.id,
      username: username,
      joinedAt: new Date()
    };

    console.log(`${username} joined the chat`);

    // Notify all clients about user joining
    io.emit('userJoined', {
      message: `${username} joined the chat`,
      users: Object.values(users),
      timestamp: new Date(),
      type: 'system'
    });

    // Send message history to new user
    socket.emit('messageHistory', messageHistory);
  });

  // Handle incoming messages
  socket.on('sendMessage', (data) => {
    const { message, username } = data;
    
    const chatMessage = {
      id: socket.id,
      username: username,
      message: message,
      timestamp: new Date(),
      type: 'user'
    };

    // Store message in history
    messageHistory.push(chatMessage);

    // Keep only last 100 messages
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }

    console.log(`${username}: ${message}`);

    // Broadcast message to all clients
    io.emit('receiveMessage', chatMessage);
  });

  // Handle user typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', {
      username: data.username,
      userId: socket.id
    });
  });

  // Handle stop typing
  socket.on('stopTyping', (data) => {
    socket.broadcast.emit('userStoppedTyping', {
      userId: socket.id
    });
  });

  // Get active users
  socket.on('getUsers', () => {
    socket.emit('usersList', Object.values(users));
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      delete users[socket.id];
      console.log(`${username} disconnected`);

      // Notify all clients about user leaving
      io.emit('userLeft', {
        message: `${username} left the chat`,
        users: Object.values(users),
        timestamp: new Date(),
        type: 'system'
      });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error: ${error}`);
  });
});

// REST endpoint to get server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Chat server running',
    connectedUsers: Object.keys(users).length,
    messageCount: messageHistory.length
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Chat server is running on http://localhost:${PORT}`);
  console.log(`WebSocket connections ready`);
});
