import { useEffect, useState } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { useAuthStore } from '../store/useAuthStore';
import { UserMinus, UserX, UserPlus, Search } from 'lucide-react';

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    friends,
    friendRequests,
    searchResults,
    isLoading,
    loadFriends,
    loadFriendRequests,
    acceptFriendRequest,
    sendFriendRequest,
    removeFriend,
    blockUser,
    searchUsers,
    clearSearch,
  } = useFriendStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, searchUsers, clearSearch]);

  return (
    <div className='container mx-auto px-4 h-[calc(100vh-64px)] mt-16 pt-16 overflow-y-auto animate-fade-in'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Search Section */}
        <section className='bg-base-100/50 backdrop-blur-lg rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50' />
            <input
              type='text'
              placeholder='Search users by email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50 transition-all duration-200'
            />
          </div>
          {searchQuery && (
            <div className='mt-4 space-y-3'>
              {isLoading ? (
                <div className='flex justify-center py-4'>
                  <span className='loading loading-spinner loading-md text-primary'></span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between p-4 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'>
                    <div className='flex items-center gap-3'>
                      <div className='avatar'>
                        <div className='size-12 rounded-full relative'>
                          <img
                            src={
                              user.avatar ||
                              `https://robohash.org/${user.id}.png`
                            }
                            alt={user.fullName}
                            className='object-cover'
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className='font-medium'>{user.fullName}</h3>
                        <p className='text-sm text-base-content/70'>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className='btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform duration-200'>
                      <UserPlus className='size-4' />
                      Add Friend
                    </button>
                  </div>
                ))
              ) : (
                <p className='text-base-content/70 text-center'>
                  No users found
                </p>
              )}
            </div>
          )}
        </section>

        {/* Friend Requests Section */}
        <section className='bg-base-100/50 backdrop-blur-lg rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <h2 className='text-2xl font-bold mb-6'>Friend Requests</h2>
          <div className='space-y-3'>
            {!friendRequests || friendRequests.length === 0 ? (
              <p className='text-base-content/70 text-center'>
                No pending friend requests
              </p>
            ) : (
              friendRequests.map((request) => (
                <div
                  key={request.id}
                  className='flex items-center justify-between p-4 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'>
                  <div className='flex items-center gap-3'>
                    <div className='avatar'>
                      <div className='size-12 rounded-full relative'>
                        <img
                          src={request.avatar || '/avatar.png'}
                          alt={request.fullName}
                          className='object-cover'
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className='font-medium'>{request.fullName}</h3>
                      <p className='text-sm text-base-content/70'>
                        {request.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className='btn btn-primary btn-sm hover:scale-105 transition-transform duration-200'>
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Friends List Section */}
        <section className='bg-base-100/50 backdrop-blur-lg rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <h2 className='text-2xl font-bold mb-6'>Friends</h2>
          <div className='space-y-3'>
            {friends.length === 0 ? (
              <p className='text-base-content/70 text-center'>
                No friends added yet
              </p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className='flex items-center justify-between p-4 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'>
                  <div className='flex items-center gap-3'>
                    <div className='avatar'>
                      <div className='size-12 rounded-full relative'>
                        <img
                          src={
                            friend.avatar ||
                            `https://robohash.org/${friend.id}.png`
                          }
                          alt={friend.fullName}
                          className='object-cover'
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className='font-medium'>{friend.fullName}</h3>
                      <p className='text-sm text-base-content/70'>
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className='btn btn-ghost btn-sm hover:scale-110 transition-transform duration-200'
                      title='Remove friend'>
                      <UserMinus className='size-5' />
                    </button>
                    <button
                      onClick={() => blockUser(friend.id)}
                      className='btn btn-ghost btn-sm hover:scale-110 transition-transform duration-200'
                      title='Block user'>
                      <UserX className='size-5' />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Friends;
