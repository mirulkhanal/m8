import { useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { useAuthStore } from '../store/useAuthStore';
import { UserMinus, UserX } from 'lucide-react';
import SearchUsers from '../components/SearchUsers';
import FriendRequests from '../components/FriendRequests';

const Friends = () => {
  const {
    friends,
    loadFriends,
    loadFriendRequests,
    removeFriend,
    blockUser,
  } = useFriendStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

  return (
    <div className='container mx-auto px-4 h-[calc(100vh-64px)] mt-16 pt-16 overflow-y-auto animate-fade-in'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Search Section */}
        <SearchUsers />

        {/* Friend Requests Section */}
        <FriendRequests />

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
