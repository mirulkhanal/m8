import { create } from 'zustand';
import { api } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useFriendStore } from './useFriendStore';
import { useListStore } from './useListStore';
import { io } from 'socket.io-client';

// Singleton socket instance
let userSocket;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isAuthenticated: false, // This was missing!
  onlineUsers: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get('/auth/check-auth');
      console.log('Auth check response:', res.data);
      
      if (res.data && res.data.user) {
        set({
          authUser: res.data.user,
          isAuthenticated: true,
        });

        // Initialize user socket for notifications
        const userId = res.data.user.id;
        initUserNotificationSocket(userId);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ authUser: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Successfully signed up');
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await api.get('/auth/logout');
      
      // Disconnect socket on logout
      if (userSocket) {
        userSocket.disconnect();
        userSocket = null;
      }
      
      set({ authUser: null, isAuthenticated: false });
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.response?.data?.message || 'Error logging out');
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post('/auth/login', data);
      console.log('Login response:', res.data);
      
      // The response structure is different than what you're expecting
      // It should be res.data.user but your controller returns token directly
      set({ 
        authUser: res.data.user || res.data, // Handle both possible structures
        isAuthenticated: true 
      });
      
      // Initialize socket after successful login
      if (res.data.user?.id || res.data?.id) {
        const userId = res.data.user?.id || res.data?.id;
        initUserNotificationSocket(userId);
      }
      
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (image, fullName) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      if (fullName) formData.append('fullName', fullName);
      if (image) formData.append('avatar', image);

      const res = await api.patch('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ authUser: res.data.data.user });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

// Function to initialize user notification socket
function initUserNotificationSocket(userId) {
  if (!userSocket && userId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009';
    userSocket = io(`${baseUrl}/user`, { withCredentials: true });

    userSocket.on('connect', () => {
      console.log('User notification socket connected');
      userSocket.emit('joinUserRoom', { userId });
    });

    // Listen for friend request notifications
    userSocket.on('friendRequestReceived', (data) => {
      console.log('Friend request received:', data);
      // Use the handleFriendRequest method to update the state
      useFriendStore.getState().handleFriendRequest(data);
    });

    // Listen for list invite notifications
    userSocket.on('listInviteReceived', (data) => {
      console.log('List invite received:', data);
      // Use the handleListInvite method to update the state
      useListStore.getState().handleListInvite(data);
    });

    userSocket.on('disconnect', () => {
      console.log('User notification socket disconnected');
    });
  }

  return userSocket;
}
