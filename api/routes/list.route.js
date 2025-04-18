import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import {
  createList,
  inviteToList,
  addItem,
  getListMembers,
  fetchListForAuthUser,
  getListItems,
  getGroupInvites,
  acceptInvite,
  toggleItemCompletion,
  removeMemberFromList, // Add this import
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
api.patch('/item/:itemId/toggle', verifyAuth, toggleItemCompletion);
api.post('/remove-member', verifyAuth, removeMemberFromList); // Add this route

export default api;
