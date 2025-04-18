import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import {
  createList,
  inviteToList,
  addItem,
  getListMembers,
  fetchListForAuthUser,
  getListItems,
  getGroupInvites, // Add new import
  acceptInvite,
} from '../controllers/list.controller.js';

const api = express.Router();

api.get('/', verifyAuth, fetchListForAuthUser);
api.post('/create', verifyAuth, createList);
api.post('/invite', verifyAuth, inviteToList);
api.post('/add-item', verifyAuth, addItem);
api.get('/:listId/members', verifyAuth, getListMembers);
api.get('/:listId/items', verifyAuth, getListItems);
api.get('/invites', verifyAuth, getGroupInvites);
api.post('/accept-invite', verifyAuth, acceptInvite);

export default api;
