import React, { useEffect, useRef } from 'react';
import { useListStore } from '../store/useListStore';
import { List, Plus, Users, CheckSquare, Square } from 'lucide-react'; // Added CheckSquare, Square
import ListItemForm from './ListItemForm';
import { useAuthStore } from '../store/useAuthStore';

const ListView = ({ setShowMembersSidebar }) => {
  // Added toggleItemCompletion
  const {
    selectedList,
    selectedListItems,
    joinListRoom,
    toggleItemCompletion,
  } = useListStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null); // Keep for potential future auto-scroll needs

  // Auto-scroll to bottom when new items are added (optional, might be less useful with checkboxes)
  // useEffect(() => {
  //   if (messageEndRef.current) {
  //     messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [selectedListItems]);

  // Handle socket connection and room joining
  useEffect(() => {
    if (!selectedList || !authUser) return;
    // Ensure joinListRoom is called correctly when list or user changes
    joinListRoom(selectedList.id, authUser.id);
    // No cleanup needed here as socket connection is managed globally in the store
  }, [selectedList?.id, authUser?.id, joinListRoom]); // Depend on IDs

  const handleToggle = (itemId) => {
    toggleItemCompletion(itemId);
  };

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
          <div className='space-y-3'>
            {selectedListItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ease-in-out border ${
                  item.completed
                    ? 'bg-base-200 border-base-300 opacity-60' // Style completed items
                    : 'bg-base-100 border-base-300 hover:bg-base-200 hover:shadow-sm'
                }`}>
                {/* Checkbox for Completion */}
                <button
                  onClick={() => handleToggle(item.id)}
                  className='btn btn-ghost btn-sm p-1'>
                  {item.completed ? (
                    <CheckSquare className='w-5 h-5 text-success' />
                  ) : (
                    <Square className='w-5 h-5 text-base-content/50' />
                  )}
                </button>

                {/* Item Details */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={`font-medium ${
                      item.completed ? 'line-through' : '' // Strikethrough completed items
                    }`}>
                    {item.content} {/* Item Name */}
                  </p>
                  {/* Display metadata if available */}
                  {(item.metadata?.quantity ||
                    item.metadata?.unit ||
                    item.metadata?.category) && (
                    <p className='text-xs text-base-content/70 mt-1'>
                      {item.metadata.quantity && `${item.metadata.quantity} `}
                      {item.metadata.unit && `${item.metadata.unit} `}
                      {item.metadata.category && `(${item.metadata.category})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full'>
            <div className='text-center space-y-4'>
              <p className='text-base-content/70'>No items in this list yet</p>
              {/* Button to focus the input form could be added here */}
            </div>
          </div>
        )}
        {/* <div ref={messageEndRef} /> */}
      </div>
      <ListItemForm /> {/* The form now includes metadata inputs */}
    </div>
  );
};

export default ListView;
