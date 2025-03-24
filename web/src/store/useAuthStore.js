import { create } from 'zustand';
import { api } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check-auth');
      set({ authUser: response.data });
    } catch (error) {
      console.log('checkAuth action Error: ', error);
      set({ authUser: null });
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
      set({ authUser: null });
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post('/auth/login', data);
      set({ authUser: res.data });
      toast.success('Successfully logged in');
    } catch (error) {
      toast.error(error.response.data.message);
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
