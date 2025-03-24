import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useListStore } from '../store/useListStore';
import { Plus, List } from 'lucide-react';

const ListView = () => {
  const { authUser } = useAuthStore();
  const {
    selectedList,
    selectedListItems,
    addItem,
    connectToList,
    disconnectFromList,
  } = useListStore();
  const [itemContent, setItemContent] = useState('');
  const messageEndRef = useRef(null);

  // Handle socket connection when list is selected
  useEffect(() => {
    if (selectedList) {
      const socket = connectToList(selectedList.id, authUser.id);

      // Listen for new items
      socket.on('new_item', (item) => {
        set((state) => ({
          selectedListItems: [...state.selectedListItems, item],
        }));
      });

      // Cleanup on unmount
      return () => {
        disconnectFromList();
      };
    }
  }, [selectedList, authUser.id, connectToList, disconnectFromList]);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedListItems]);

  const handleAddItem = () => {
    if (itemContent.trim()) {
      addItem(itemContent);
      setItemContent('');
    }
  };

  return (
    <div className='flex flex-col h-full bg-base-100 w-full'>
      {' '}
      {/* Add w-full here */}
      {/* List Header */}
      <div className='p-6 border-b border-base-300 w-full'>
        {' '}
        {/* Add w-full here */}
        <div className='flex items-center gap-3'>
          <List className='w-6 h-6' />
          <h1 className='text-2xl font-bold'>{selectedList?.name}</h1>
        </div>
      </div>
      {/* List Content */}
      <div className='flex-1 overflow-y-auto p-6 w-full'>
        {' '}
        {/* Add w-full here */}
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
      {/* Add Item Form */}
      <div className='sticky bottom-0 p-4 bg-base-100 border-t border-base-300 w-full'>
        {' '}
        {/* Add w-full here */}
        <div className='flex gap-2'>
          <input
            type='text'
            value={itemContent}
            onChange={(e) => setItemContent(e.target.value)}
            placeholder='Add new item...'
            className='input input-bordered flex-1 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary'
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <button
            onClick={handleAddItem}
            className='btn btn-primary gap-2 transition-all duration-300 ease-in-out hover:scale-105'>
            <Plus className='w-4 h-4' />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListView;
