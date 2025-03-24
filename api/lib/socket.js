import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Join a specific list room
  socket.on('joinList', (listId) => {
    socket.join(listId);
    console.log(`User ${userId} joined list ${listId}`);
  });

  // Add the item and send it to everyone in the list room
  socket.on('list:add', (listId, item) => {
    io.to(listId).emit('list', {
      type: 'ADD',
      data: item,
    });
  });

  // Remove the item and send the id to everyone in the list room
  socket.on('list:remove', (listId, id) => {
    io.to(listId).emit('list', {
      type: 'REMOVE',
      ids: id,
    });
  });

  // Toggle the item and send it to everyone in the list room
  socket.on('list:toggle', (listId, id) => {
    io.to(listId).emit('list', {
      type: 'UPDATE',
      ids: id,
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
