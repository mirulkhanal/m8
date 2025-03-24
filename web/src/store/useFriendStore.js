import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';

const initialState = {
  friends: [],
  friendRequests: [],
  searchResults: [],
  isLoading: false,
};

export const useFriendStore = create((set) => ({
  ...initialState,
  friends: [],
  friendRequests: [],
  isLoading: false,

  sendFriendRequest: async (userId) => {
    try {
      await api.post('/friend/send-request', { userId });
      toast.success('Friend request sent');
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await api.post('/friend/accept-request', { userId });
      set((state) => ({
        friendRequests: state.friendRequests.filter((id) => id !== userId),
      }));
      toast.success('Friend request accepted');
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  },

  removeFriend: async (userId) => {
    try {
      await api.post('/friend/remove', { userId });
      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== userId),
      }));
      toast.success('Friend removed');
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  },

  blockUser: async (userId) => {
    try {
      await api.post('/friend/block', { userId });
      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== userId),
      }));
      toast.success('User blocked');
    } catch (error) {
      toast.error('Failed to block user');
    }
  },

  loadFriends: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/friend/list');
      set({ friends: res.data });
    } catch (error) {
      toast.error('Failed to load friends');
    } finally {
      set({ isLoading: false });
    }
  },

  loadFriendRequests: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/friend/requests');
      set({ friendRequests: res.data });
    } catch (error) {
      toast.error('Failed to load friend requests');
    } finally {
      set({ isLoading: false });
    }
  },

  searchUsers: async (email) => {
    if (!email) {
      set({ searchResults: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get('/friend/search', { params: { email } });
      set({ searchResults: res.data });
    } catch (error) {
      toast.error('Failed to search users');
      set({ searchResults: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSearch: () => {
    set({ searchResults: [] });
  },
}));