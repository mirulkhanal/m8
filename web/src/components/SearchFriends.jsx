import { useEffect, useState } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { Search, UserPlus } from 'lucide-react';

const SearchFriends = ({ onFriendSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, isLoading } = useFriendStore();

  const [filteredFriends, setFilteredFriends] = useState([]);

  console.log(searchQuery);
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchQuery) {
        const results = friends.filter((friend) =>
          friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFriends(results);
      } else {
        setFilteredFriends([]);
      }
    }, 300);

    console.log('Filtered friends:', filteredFriends);
    return () => clearTimeout(debounceSearch);
  }, [searchQuery, friends]);

  return (
    <section className='bg-base-100/50 backdrop-blur-lg rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50' />
        <input
          type='text'
          placeholder='Search your friends...'
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
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
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
                <button
                  onClick={() => onFriendSelect(friend.id)}
                  className='btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform duration-200'>
                  <UserPlus className='size-4' />
                  Add to Group
                </button>
              </div>
            ))
          ) : (
            <p className='text-base-content/70 text-center'>No friends found</p>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchFriends;
