import express from 'express';
import authRoutes from './routes/auth.route.js';
import listRoutes from './routes/list.route.js';
import friendRoutes from './routes/friend.route.js';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { app, server } from './lib/socket.js';

dotenv.config();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/list', listRoutes);
app.use('/api/friend', friendRoutes);

// app.use('/', (_, res) => {
//   res.send('Welcome to Chatty Backend API');
// });

app.use(errorHandler);

server.listen(process.env.PORT || 5989, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
