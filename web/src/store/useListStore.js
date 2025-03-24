import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import { io } from 'socket.io-client';

export const useListStore = create((set, get) => ({
  lists: [],
  socket: null,
  selectedList: null,
  selectedListItems: [],
  selectedListMembers: [],
  isSelectedListMembersLoading: false,
  isListsLoading: false,
  isItemsLoading: false,

  createList: async (name) => {
    try {
      const res = await api.post('/list/create', { name });
      set((state) => ({ lists: [...state.lists, res.data.data] }));
      toast.success('List created successfully');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  loadUserLists: async () => {
    set({ isListsLoading: true });
    try {
      const res = await api.get('/list');
      set({ lists: res.data || [] });
    } catch (error) {
      console.error('Failed to load lists');
    } finally {
      set({ isListsLoading: false });
    }
  },

  inviteToList: async (listId, userId) => {
    try {
      await api.post('/list/invite', { listId, userId });
      toast.success('User invited successfully');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Initialize socket connection when a list is selected
  connectToList: (listId, userId) => {
    const socket = io('http://localhost:5009', {
      query: { listId, userId },
    });
    set({ socket });
    return socket;
  },

  // Disconnect socket when leaving a list
  disconnectFromList: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Add item and emit socket event
  addItem: async (content) => {
    const { selectedList, socket } = get();
    try {
      const res = await api.post('/list/add-item', {
        listId: selectedList.id,
        content,
      });
      const newItem = res.data.data;

      // Update local state
      set((state) => ({
        selectedListItems: [...state.selectedListItems, newItem],
      }));

      // Emit socket event to notify other members
      if (socket) {
        socket.emit('new_item', {
          listId: selectedList.id,
          item: newItem,
        });
      }

      toast.success('Item added successfully');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  selectList: async (list) => {
    set({ selectedList: list, selectedListItems: list.items || [] });
  },

  getMembersForSelectedList: async () => {
    const { listMembers } = get();

    await listMembers();

    return;
  },
  listMembers: async () => {
    const { selectedList } = get();
    set({ isSelectedListMembersLoading: true });
    try {
      const res = await api.get(`/${selectedList.id}/members`);

      console.log('Selected List Members fetched: ', res.data);
      set({ selectedListMembers: res.data });
      toast.success('Item added successfully');
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSelectedListMembersLoading: false });
    }
  },
}));
