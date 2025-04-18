import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { useListStore } from './useListStore';
import { useFriendStore } from './useFriendStore';

// Singleton socket instances
let userSocket;

export const useSocketStore = create((set, get) => ({
  isConnected: false,
  
  initUserSocket: (userId) => {
    if (!userId) return;
    
    if (!userSocket) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009';
      userSocket = io(`${baseUrl}/user`, { withCredentials: true });
      
      userSocket.on('connect', () => {
        console.log('User socket connected:', userSocket.id);
        set({ isConnected: true });
        
        // Join user's personal room
        userSocket.emit('joinUserRoom', userId);
      });
      
      userSocket.on('disconnect', () => {
        console.log('User socket disconnected');
        set({ isConnected: false });
      });
      
      // Handle friend request received
      userSocket.on('friendRequestReceived', (request) => {
        console.log('Friend request received:', request);
        // Update friend store
        useFriendStore.getState().handleFriendRequest(request);
      });
      
      // Handle list invite received
      userSocket.on('listInviteReceived', (invite) => {
        console.log('List invite received:', invite);
        // Update list store
        useListStore.getState().handleListInvite(invite);
      });
    }
    
    return userSocket;
  },
  
  disconnectSockets: () => {
    if (userSocket) {
      userSocket.disconnect();
      userSocket = null;
    }
    set({ isConnected: false });
  }
}));