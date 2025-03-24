import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import {
  createList,
  inviteToList,
  addItem,
  getListMembers,
  fetchListForAuthUser,
  getListItems, // Add new import
} from '../controllers/list.controller.js';

const api = express.Router();

api.get('/', verifyAuth, fetchListForAuthUser);
api.post('/create', verifyAuth, createList);
api.post('/invite', verifyAuth, inviteToList);
api.post('/add-item', verifyAuth, addItem);
api.get('/:listId/members', verifyAuth, getListMembers);
api.get('/:listId/items', verifyAuth, getListItems); // Add new route

export default api;
