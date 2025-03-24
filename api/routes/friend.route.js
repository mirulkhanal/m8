import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  getFriends,
  getFriendRequests,
  searchUsers,
} from '../controllers/friend.controller.js';

const api = express.Router();

api.post('/send-request', verifyAuth, sendFriendRequest);
api.post('/accept-request', verifyAuth, acceptFriendRequest);
api.post('/remove', verifyAuth, removeFriend);
api.post('/block', verifyAuth, blockUser);
api.get('/list', verifyAuth, getFriends);
api.get('/requests', verifyAuth, getFriendRequests);
api.get('/search', verifyAuth, searchUsers);

export default api;
