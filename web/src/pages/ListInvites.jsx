import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useListStore } from '../store/useListStore';

export default function ListInvites() {
  const { listInvites, acceptListInvite, loadListInvites } = useListStore();

  useEffect(() => {
    loadListInvites();
  }, [loadListInvites]);

  return (
    <section className='bg-base-100/50 backdrop-blur-lg rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
      <h2 className='text-2xl font-bold mb-6'>List Invitations</h2>
      <div className='space-y-3'>
        {listInvites && listInvites.length === 0 ? (
          <p className='text-base-content/70 text-center'>
            No pending list invitations
          </p>
        ) : (
          listInvites &&
          listInvites.map((invite) => (
            <div
              key={invite.listId}
              className='flex items-center justify-between p-4 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center gap-3'>
                <div className='avatar'>
                  <div className='size-12 rounded-full relative'>
                    <img
                      src={`https://robohash.org/${invite.inviterId}.png`}
                      alt={invite.inviterName}
                      className='object-cover'
                    />
                  </div>
                </div>
                <div>
                  <h3 className='font-medium'>{invite.listName}</h3>
                  <p className='text-sm text-base-content/70'>
                    Invited by {invite.inviterName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => acceptListInvite(invite.listId)}
                className='btn btn-primary btn-sm hover:scale-105 transition-transform duration-200'>
                <Users className='size-4' />
                Join
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
