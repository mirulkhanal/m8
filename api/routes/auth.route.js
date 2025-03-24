import express from 'express';
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth,
} from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/verifyAuth.js';

const api = express.Router();

api.post('/signup', signup);
api.post('/login', login);
api.get('/logout', verifyAuth, logout);
api.patch('/update-profile', verifyAuth, updateProfile);
api.get('/check-auth', verifyAuth, checkAuth);
export default api;
