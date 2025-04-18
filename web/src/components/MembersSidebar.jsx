import React, { useEffect, useState, useCallback } from 'react';
import { Users, X, Search, UserPlus, Loader2, UserMinus } from 'lucide-react'; // Add UserMinus
import { useListStore } from '../store/useListStore';
import { useAuthStore } from '../store/useAuthStore';
import { debounce } from 'lodash-es';

// Removed AddMemberButton import

export default function MembersSidebar({ isOpen, onClose, listId }) {
  const {
    selectedListMembers,
    loadListMembers,
    isSelectedListMembersLoading,
    userSearchResults,
    isSearchingUsers,
    searchUsersForInvite,
    clearUserSearch,
    inviteUserToList,
    removeMemberFromList, // Add this
    selectedList, // Add this to check if current user is owner
  } = useListStore();
  const { authUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Load members when the sidebar opens or listId changes
  useEffect(() => {
    if (isOpen && listId) {
      loadListMembers(listId);
    } else {
      // Clear search when sidebar closes or listId is null
      setSearchQuery('');
      clearUserSearch();
    }
  }, [isOpen, listId, loadListMembers, clearUserSearch]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchUsersForInvite(query);
    }, 300), // 300ms debounce delay
    [searchUsersForInvite] // Dependency array for useCallback
  );

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      clearUserSearch();
    }
    // Cleanup debounce timer on unmount or query change
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch, clearUserSearch]);

  const handleInviteClick = (userId) => {
    inviteUserToList(userId);
    setSearchQuery(''); // Clear search input after invite
  };

  // Check if current user is the list owner
  const isListOwner =
    selectedList && authUser && selectedList.ownerId === authUser.id;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-72 bg-base-100 border-l border-base-300 z-50 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
      <div className='h-full flex flex-col'>
        {/* Header */}
        <div className='border-b border-base-300 p-4 flex justify-between items-center'>
          <h2 className='text-lg font-bold flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Members
          </h2>
          <button onClick={onClose} className='btn btn-ghost btn-sm btn-circle'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Add Member Search Section */}
        <div className='p-4 border-b border-base-300'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50' />
            <input
              type='text'
              placeholder='Invite user by email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='input input-sm input-bordered w-full pl-9 bg-base-200 focus:bg-base-100'
            />
            {isSearchingUsers && (
              <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 animate-spin' />
            )}
          </div>
          {/* Search Results Dropdown/List */}
          {searchQuery &&
            (userSearchResults.length > 0 || isSearchingUsers) && (
              <div className='mt-2 max-h-40 overflow-y-auto bg-base-200 rounded-md shadow-lg p-2 space-y-1'>
                {isSearchingUsers && !userSearchResults.length ? (
                  <div className='text-center text-xs text-base-content/60 py-2'>
                    Searching...
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center justify-between p-2 rounded hover:bg-base-300 transition-colors'>
                      <div className='flex items-center gap-2 overflow-hidden'>
                        <img
                          src={
                            user.avatar || `https://robohash.org/${user.id}.png`
                          }
                          alt={user.fullName}
                          className='size-7 rounded-full object-cover flex-shrink-0'
                        />
                        <span
                          className='text-sm truncate font-medium'
                          title={user.fullName}>
                          {user.fullName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleInviteClick(user.id)}
                        className='btn btn-xs btn-ghost text-primary hover:bg-primary/10 p-1'>
                        <UserPlus className='size-4' />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className='text-center text-xs text-base-content/60 py-2'>
                    No users found.
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Members List Section */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          {isSelectedListMembersLoading ? (
            <div className='flex justify-center py-4'>
              <span className='loading loading-spinner loading-md'></span>
            </div>
          ) : selectedListMembers.length > 0 ? (
            selectedListMembers.map((member) => (
              <div
                key={member.id}
                className='flex items-center justify-between p-2 bg-base-100 rounded-lg hover:bg-base-200 transition-colors'>
                <div className='flex items-center gap-3'>
                  <div className='avatar'>
                    <div className='size-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1'>
                      <img
                        src={
                          member.avatar ||
                          `https://robohash.org/${member.id}.png`
                        }
                        alt={member.fullName}
                        className='object-cover'
                      />
                    </div>
                  </div>
                  <div className='overflow-hidden'>
                    <p
                      className='text-sm font-semibold truncate'
                      title={member.fullName}>
                      {member.fullName}
                      {member.id === authUser?.id && ' (You)'}{' '}
                      {/* Indicate current user */}
                      {member.id === selectedList?.ownerId && ' (Owner)'}{' '}
                      {/* Indicate owner */}
                    </p>
                  </div>
                </div>

                {/* Show remove button if current user is owner and member is not the owner */}
                {isListOwner && member.id !== authUser?.id && (
                  <button
                    onClick={() => removeMemberFromList(member.id)}
                    className='btn btn-xs btn-ghost text-error hover:bg-error/10 p-1'
                    title='Remove member'>
                    <UserMinus className='size-4' />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className='text-center text-sm text-base-content/70 pt-4'>
              No members in this list yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
