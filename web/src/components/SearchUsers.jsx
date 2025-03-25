import { useEffect, useState } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { Search, UserPlus } from 'lucide-react';

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, isLoading, searchUsers, clearSearch, sendFriendRequest } =
    useFriendStore();

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
  );
};

export default SearchUsers;