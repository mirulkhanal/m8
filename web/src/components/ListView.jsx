import React, { useEffect, useRef } from 'react';
import { useListStore } from '../store/useListStore';
import { List, Plus, Users } from 'lucide-react';
import ListItemForm from './ListItemForm';
import { useAuthStore } from '../store/useAuthStore';

const ListView = ({ setShowMembersSidebar }) => {
  const { selectedList, selectedListItems, joinListRoom } = useListStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedListItems]);

  // Handle socket connection and room joining
  useEffect(() => {
    if (!selectedList || !authUser) return;

    // Join the list room via the store
    joinListRoom(selectedList.id, authUser.id);
  }, [selectedList, authUser, joinListRoom]);

  return (
    <div className='flex-1 flex flex-col h-full bg-base-100'>
      {/* List Header */}
      <div className='p-6 border-b border-base-300'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <List className='w-6 h-6' />
            <h1 className='text-2xl font-bold'>{selectedList?.name}</h1>
          </div>
          <button
            onClick={() => setShowMembersSidebar(true)}
            className='btn btn-ghost btn-sm gap-2'>
            <Users className='w-5 h-5' />
            <span>Members</span>
          </button>
        </div>
      </div>
      {/* List Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        {selectedListItems.length > 0 ? (
          <div className='space-y-4'>
            {selectedListItems.map((item) => (
              <div
                key={item.id}
                className='p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-all duration-300 ease-in-out transform hover:scale-[1.02]'>
                <p className='text-base-content'>{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full'>
            <div className='text-center space-y-4'>
              <p className='text-base-content/70'>No items in this list yet</p>
              <button
                className='btn btn-primary gap-2 animate-bounce'
                onClick={() => messageEndRef.current?.scrollIntoView()}>
                <Plus className='w-4 h-4' />
                Add your first item
              </button>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      <ListItemForm />
    </div>
  );
};

export default ListView;
