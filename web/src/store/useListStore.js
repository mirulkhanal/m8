import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/axios';
import { io } from 'socket.io-client';
// Import friend store to potentially trigger friend list refresh
import { useFriendStore } from './useFriendStore';
import { useAuthStore } from './useAuthStore';

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
  userSearchResults: [],
  isSearchingUsers: false,

  initSocket: (userId) => {
    if (!socket) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009';
      socket = io(`${baseUrl}/list`, { withCredentials: true });

      // --- Socket Event Listeners ---
      socket.on('itemAdded', ({ listId, item }) => {
        const { selectedList, selectedListItems } = get();
        if (selectedList && selectedList.id === listId) {
          const itemExists = selectedListItems.some(
            (existingItem) => existingItem.id === item.id
          );
          if (!itemExists) {
            // Add the new item with metadata and completed status
            set({ selectedListItems: [...selectedListItems, item] });
          }
        }
      });

      // Listener for item updates (like completion toggle)
      socket.on('itemUpdated', ({ listId, item: updatedItem }) => {
        const { selectedList, selectedListItems } = get();
        if (selectedList && selectedList.id === listId) {
          set({
            selectedListItems: selectedListItems.map((item) =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          });
        }
      });

      // Listener for member removal
      socket.on('memberRemoved', ({ listId, memberId }) => {
        const { selectedList, selectedListMembers } = get();
        if (selectedList && selectedList.id === listId) {
          // If the current user is removed, they should be redirected
          if (memberId === userId) {
            toast.error('You have been removed from this list');
            // Clear selected list
            set({ selectedList: null, selectedListItems: [] });
          } else {
            // Otherwise just update the members list
            set({
              selectedListMembers: selectedListMembers.filter(member => member.id !== memberId)
            });
            toast.info('A member has been removed from this list');
          }
        }
      });

      // Add listeners for 'connect', 'disconnect', 'error' etc. as needed
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(`Socket connection error: ${error}`);
      });
      // --- End Socket Event Listeners ---
    }

    return socket;
  },

  joinListRoom: (listId, userId) => {
    const socket = get().initSocket(userId); // Ensure socket is initialized
    if (socket && listId && userId) {
      console.log(
        `Attempting to join list room: ${listId} for user: ${userId}`
      );
      socket.emit('joinList', { listId, userId });

      // Listen for confirmation or errors specifically for this join attempt
      socket.once('joinedList', (joinedListId) => {
        if (joinedListId === listId) {
          console.log(`Successfully joined list room: ${listId}`);
        }
      });
      socket.once('error', (errorMessage) => {
        // Check if the error is related to joining this specific list
        console.error(`Error joining list room ${listId}: ${errorMessage}`);
        toast.error(`Failed to join list ${listId}: ${errorMessage}`);
      });
    } else {
      console.error(
        'Cannot join list room: Socket not ready, or missing listId/userId'
      );
    }
  },

  // Update the handleListInvite method to properly format the invite data
  handleListInvite: (invite) => {
    // Make sure we have a properly formatted invite object
    const formattedInvite = {
      listId: invite.listId || invite.id,
      listName: invite.listName || invite.name,
      inviterId: invite.inviterId || invite.ownerId,
      inviterName: invite.inviterName || invite.ownerName,
      inviterAvatar: invite.inviterAvatar || invite.ownerAvatar,
    };

    set((state) => ({
      listInvites: [...state.listInvites, formattedInvite],
    }));
    toast.success(`You've been invited to list ${formattedInvite.listName}`);
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
      toast.success('List invitation accepted!');
      // Trigger a refresh of the friends list in the friend store
      useFriendStore.getState().loadFriends();
      get().loadUserLists(); // Refresh user's lists
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to accept invitation'
      );
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

  addItem: async (content, metadata = {}) => {
    const { selectedList } = get();
    if (!selectedList) {
      toast.error('No list selected');
      return;
    }
    try {
      await api.post('/list/add-item', {
        listId: selectedList.id,
        content,
        metadata,
      });
      toast.success('Item added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  },

  selectList: async (list) => {
    const currentSelectedListId = get().selectedList?.id;
    const newSelectedListId = list?.id;

    // Only proceed if the list selection is actually changing
    if (currentSelectedListId !== newSelectedListId) {
      set({ selectedList: list, selectedListItems: list?.items || [] });

      // Join the new list's socket room if a list is selected
      if (newSelectedListId) {
        const authUserId = useAuthStore.getState().authUser?.id;
        if (authUserId) {
          get().joinListRoom(newSelectedListId, authUserId);
        } else {
          console.error("Cannot join list room: User not authenticated.");
        }
      }
    } else if (list && !get().selectedListItems.length && list.items?.length) {
      // If the same list is selected but items were missing (e.g., initial load)
      set({ selectedListItems: list.items });
    }
  },

  getMembersForSelectedList: async () => {
    const { listMembers } = get();
    await listMembers();
    return;
  },

  loadListMembers: async (listId) => {
    if (!listId) return;
    set({ isSelectedListMembersLoading: true });
    try {
      const response = await api.get(`/list/${listId}/members`);
      set({ selectedListMembers: response.data });
    } catch (error) {
      console.error('Failed to load list members:', error);
      toast.error('Failed to load list members');
      set({ selectedListMembers: [] }); // Clear on error
    } finally {
      set({ isSelectedListMembersLoading: false });
    }
  },

  inviteUserToList: async (userIdToInvite) => {
    const { selectedList } = get();
    if (!selectedList) {
      toast.error('No list selected to invite to.');
      return;
    }
    if (!userIdToInvite) {
      toast.error('No user selected to invite.');
      return;
    }

    try {
      await api.post('/list/invite', {
        listId: selectedList.id,
        userId: userIdToInvite,
      });
      toast.success('Invitation sent successfully!');
      set({ userSearchResults: [] }); // Clear search after invite
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  },

  searchUsersForInvite: async (query) => {
    if (!query || query.trim().length < 2) {
      set({ userSearchResults: [], isSearchingUsers: false });
      return;
    }
    set({ isSearchingUsers: true });
    try {
      const response = await api.get('/friend/search', {
        params: { email: query }
      });
      // Filter out the current user and existing members from search results
      const currentUserId = useAuthStore.getState().authUser?.id;
      const existingMemberIds = get().selectedListMembers.map(m => m.id);
      const filteredResults = response.data.filter(user =>
        user.id !== currentUserId && !existingMemberIds.includes(user.id)
      );
      set({ userSearchResults: filteredResults });
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error(error.response?.data?.message || 'Failed to search users');
      set({ userSearchResults: [] });
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  clearUserSearch: () => {
    set({ userSearchResults: [], isSearchingUsers: false });
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

  toggleItemCompletion: async (itemId) => {
    const { selectedListItems } = get();
    // Optimistic UI update
    set({
      selectedListItems: selectedListItems.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });

    try {
      await api.patch(`/list/item/${itemId}/toggle`);
      // Backend will emit 'itemUpdated', which the listener will catch.
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update item status'
      );
      // Revert optimistic update on error
      set({
        selectedListItems: selectedListItems.map(
          (item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      });
    }
  },

  removeMemberFromList: async (memberId) => {
    const { selectedList } = get();
    if (!selectedList) {
      toast.error('No list selected');
      return;
    }

    try {
      await api.post('/list/remove-member', {
        listId: selectedList.id,
        memberId
      });
      
      // Update the members list locally
      set(state => ({
        selectedListMembers: state.selectedListMembers.filter(member => member.id !== memberId)
      }));
      
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  },
}));
