const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const customEnv = require('custom-env');
const http = require("http");
const { Server } = require("socket.io");
const userSockets = require('./services/socket.js');

customEnv.env(process.env.NODE_ENV, './config');

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB:", err));

// Routers
const routerUsers = require('./routes/users.js');
const routerTokens = require('./routes/tokens.js');
const routerEvents = require('./routes/events.js');
const routerChats = require('./routes/chats.js');
const routerHobbies = require('./routes/hobbies.js');
const routerExpoTokens = require('./routes/expoTokens.js');
const routerNotifications = require('./routes/notifications');
const routerUserEventsDistances = require('./routes/userEventsDistances.js');
const routerUserEventsCategories = require('./routes/userEventsCategories.js');
const routerMatches = require('./routes/matches.js');

require('./utils/scheduler.js');

const server = express();

const build = express.static('public');
server.use(build);

// Simplified CORS configuration for development
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());

// Basic test route
server.get('/', (req, res) => {
  res.send("Server is running and responding!");
});

// logging middleware for debugging
// server.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log('Request headers:', req.headers); 
//   next();
// });

// Use Routers
server.use('/users', routerUsers);
server.use('/tokens', routerTokens);
server.use('/events', routerEvents);
server.use('/chats', routerChats);
server.use('/hobbies', routerHobbies);
server.use('/expo/tokens', routerExpoTokens);
server.use('/notifications', routerNotifications);
server.use('/userEventsDistances', routerUserEventsDistances);
server.use('/userEventsCategories', routerUserEventsCategories);
server.use('/matches', routerMatches);

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// connect to socket.io
const socketServer = http.createServer(server);
const io = new Server(socketServer, {
  cors: {
      origin: `http://${process.env.SERVER_IP}:${process.env.SOCKET_PORT}`,
  }
});

io.on("connection", (socket) => {
  console.log("A socket connected:", socket.id);

  socket.on("userLoggedIn", (username) => {
    console.log(`The user ${username} has been logged in`);
    userSockets.set(username, socket);
    socket.join(username);  
  });

  socket.on('sendMessage', (sentTo, message) => {
      socket.broadcast.to(sentTo).emit('receiveMessage', message);
  });

  socket.on('addChat', (sentTo, chat) => {
      socket.broadcast.to(sentTo).emit('newChat', chat);
  });

  socket.on('removeChat', (sentTo, chatId) => {
    socket.broadcast.to(sentTo).emit('deleteChat', chatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [username, userSocket] of userSockets.entries()) {
      if (userSocket.id === socket.id) {
        userSockets.delete(username);
        console.log(`Removed ${username} from userSockets`);
        break;
      }
    }
  });

});

// Start the server
server.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});

socketServer.listen(process.env.SOCKET_PORT, () => {
  console.log(`socket server is running on port ${process.env.SOCKET_PORT}`);
});