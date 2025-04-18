import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import { io } from 'socket.io-client';

// Create a singleton socket instance
let socket;

export const useListStore = create((set, get) => ({
  lists: [],
  listInvites: [],
  selectedList: null,
  selectedListItems: [],
  isListsLoading: false,
  isItemsLoading: false,
  selectedListMembers: [],
  isSelectedListMembersLoading: false,

  // Add socket initialization function
  // In the initSocket function
  initSocket: (userId) => {
    if (!socket) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009';
      socket = io(`${baseUrl}/list`, { withCredentials: true });

      // Set up global socket event listeners
      socket.on('itemAdded', ({ listId, item }) => {
        const { selectedList, selectedListItems } = get();
        if (selectedList && selectedList.id === listId) {
          // Check if the item already exists to prevent duplicates
          const itemExists = selectedListItems.some(
            (existingItem) => existingItem.id === item.id
          );
          if (!itemExists) {
            set({ selectedListItems: [...selectedListItems, item] });
          }
        }
      });
    }

    return socket;
  },

  joinListRoom: (listId, userId) => {
    const socket = get().initSocket(userId);
    if (socket && listId) {
      socket.emit('joinList', { listId, userId });
    }
  },

  handleListInvite: (invite) => {
    set((state) => ({
      listInvites: [...state.listInvites, invite],
    }));
    toast.success(`You've been invited to list ${invite.listName}`);
  },

  loadListInvites: async () => {
    try {
      const res = await api.get('/list/invites');
      const invites = res.data.data.map((list) => ({
        listId: list.id,
        listName: list.name,
        inviterId: list.owner.id,
        inviterName: list.owner.fullName,
        inviterAvatar: list.owner.avatar,
      }));
      set({ listInvites: invites });
    } catch (error) {
      toast.error('Failed to load list invitations');
    }
  },
  acceptListInvite: async (listId) => {
    try {
      await api.post('/list/accept-invite', { listId });
      set((state) => ({
        listInvites: state.listInvites.filter(
          (invite) => invite.listId !== listId
        ),
      }));
      toast.success('List invitation accepted');
    } catch (error) {
      toast.error('Failed to accept list invitation');
    }
  },

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

  addItem: async (content) => {
    const { selectedList } = get();
    try {
      const res = await api.post('/list/add-item', {
        listId: selectedList.id,
        content,
      });
      const newItem = res.data.data;

      // We'll let the socket event handle the UI update for consistency
      // This prevents the duplicate item issue
      // The local user will receive the update through the same socket channel

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

  loadListMembers: async (listId) => {
    const { selectedList } = get();
    const id = listId || selectedList.id;
    set({ isSelectedListMembersLoading: true });
    try {
      const res = await api.get(`/list/${id}/members`);
      set({ selectedListMembers: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch members');
    } finally {
      set({ isSelectedListMembersLoading: false });
    }
  },

  listMembers: async () => {
    const { selectedList } = get();
    set({ isSelectedListMembersLoading: true });
    try {
      const res = await api.get(`/list/${selectedList.id}/members`);
      set({ selectedListMembers: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch members');
    } finally {
      set({ isSelectedListMembersLoading: false });
    }
  },

  inviteMember: async (userId) => {
    const { selectedList } = get();
    try {
      await api.post('/list/invite', {
        listId: selectedList.id,
        userId,
      });
      await get().listMembers();
      toast.success('Member invited successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    }
  },
}));
