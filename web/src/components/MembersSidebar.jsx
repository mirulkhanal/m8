import React, { useEffect, useState } from 'react';
import { Users, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useListStore } from '../store/useListStore';
import { AddMemberButton } from './AddMemberButton';

export default function MembersSidebar({ isOpen, onClose, listId }) {
  const { listMembers, loadListMembers } = useListStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && listId) {
      setIsLoading(true);
      loadListMembers(listId).finally(() => setIsLoading(false));
    }
  }, [isOpen, listId, loadListMembers]);

  return (
    <div
      className={`fixed inset-y-0 right-0 w-72 bg-base-100 border-l border-base-300 z-50 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
      <div className='h-full flex flex-col'>
        <div className='border-b border-base-300 p-4 flex justify-between items-center'>
          <h2 className='text-lg font-bold flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Members
          </h2>
          <button onClick={onClose} className='btn btn-ghost btn-sm'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          <AddMemberButton listId={listId} />
          {isLoading ? (
            <div className='flex justify-center py-4'>
              <span className='loading loading-spinner loading-md'></span>
            </div>
          ) : listMembers.length > 0 ? (
            listMembers.map((member) => (
              <div
                key={member.id}
                className='flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors'>
                <div className='relative'>
                  <img
                    src={
                      member.avatar || `https://robohash.org/${member.id}.png`
                    }
                    alt={member.fullName}
                    className='size-10 rounded-full object-cover'
                  />
                  <div
                    className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-100 ${
                      member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium truncate'>{member.fullName}</p>
                  <p className='text-xs text-base-content/70 truncate'>
                    {member.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-center text-base-content/70'>No members found</p>
          )}
        </div>
      </div>
    </div>
  );
}
