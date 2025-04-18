import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import prisma from './prisma.js';

const app = express();
const server = http.createServer(app);

// Create Socket.IO server instance
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Create a namespace for list collaboration
const listNamespace = io.of('/list');
const userNamespace = io.of('/user'); // Add user namespace for friend-related events

// Socket.IO connection handler for list namespace
listNamespace.on('connection', (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  // Event handler for joining a specific list room
  socket.on('joinList', async ({ listId, userId }) => {
    if (!listId || !userId) {
      socket.emit('error', 'Both List ID and User ID are required');
      socket.disconnect();
      return;
    }

    try {
      const list = await prisma.list.findUnique({
        where: { id: listId },
        select: { members: true },
      });

      if (!list || !list.members.includes(userId)) {
        socket.emit('error', 'Unauthorized access to list');
        socket.disconnect();
        return;
      }

      // Join the room named after the listId
      socket.join(listId);
      console.log(`Socket ${socket.id} joined list room ${listId}`);

      // Notify the client they've successfully joined
      socket.emit('joinedList', listId);
    } catch (error) {
      socket.emit('error', 'Error validating list membership');
      socket.disconnect();
    }
  });

  // Clean up when a socket disconnects
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Socket.IO connection handler for user namespace
userNamespace.on('connection', (socket) => {
  console.log(`New user socket connection: ${socket.id}`);
  
  // Join user's personal room
  socket.on('joinUserRoom', (userId) => {
    if (!userId) {
      socket.emit('error', 'User ID is required');
      return;
    }
    
    socket.join(`user:${userId}`);
    socket.emit('joinedUserRoom', userId);
  });
  
  socket.on('disconnect', () => {
    console.log(`User socket disconnected: ${socket.id}`);
  });
});

// Export io for use in controllers
export { app, server, io, listNamespace, userNamespace };
