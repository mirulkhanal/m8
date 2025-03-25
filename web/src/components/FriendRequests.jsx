import { useFriendStore } from '../store/useFriendStore';

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest } = useFriendStore();

  return (
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
                      src={
                        request.avatar ||
                        `https://robohash.org/${request.id}.png`
                      }
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
  );
};

export default FriendRequests;
