import { useEffect, useState } from 'react';
import { useListStore } from '../store/useListStore';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';
import Modal from './Modal';

const Sidebar = () => {
  const { lists, selectedList, isListsLoading, createList, selectList } =
    useListStore();
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = async () => {
    try {
      await createList(newListName);
      setShowModal(false);
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  if (isListsLoading) return <SidebarSkeleton />;

  const EmptyListState = () => (
    <div className='flex flex-col items-center justify-center h-full p-4'>
      <div className='text-center space-y-4'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
            <Users className='w-8 h-8 text-primary' />
          </div>
        </div>
        <h3 className='text-xl font-bold'>No Lists Found</h3>
        <p className='text-base-content/70'>Create your first list to get started</p>
        <button
          className='btn btn-primary gap-2'
          onClick={() => setShowModal(true)}>
          Create List
        </button>
      </div>
    </div>
  );

  return (
    <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200'>
      <div className='border-b border-base-300 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='size-6' />
          <span className='font-medium hidden lg:block'>Group Members</span>
        </div>
        <div className='mt-3 hidden lg:flex items-center gap-2'>
          <button
            className='btn btn-sm w-full bg-blue-500 text-white hover:bg-blue-600'
            onClick={() => setShowModal(true)}>
            Create List
          </button>
        </div>
      </div>

      <div className='overflow-y-auto w-full py-3'>
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => selectList(list)}
            className={`w-full p-3 flex items-center gap-3 transition-colors rounded-lg ${
              selectedList?.id === list.id
                ? 'bg-base-300 ring-2 ring-primary ring-inset' // Added ring-inset
                : 'hover:bg-base-300'
            }`}>
            {/* FIXME: Need to update this to something relevant */}
            {/* <div className='relative mx-auto lg:mx-0'>
              <img
                src='/avatar.png'
                alt={list.name}
                className='size-12 object-cover rounded-full'
              />
            </div> */}
            <div className='hidden lg:block text-left min-w-0'>
              <div className='font-medium truncate'>{list.name}</div>
            </div>
          </button>
        ))}

        {lists.length === 0 && <EmptyListState />}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className='flex flex-col items-center space-y-4 p-4'>
            <h3 className='text-3xl font-bold text-accent-content'>
              Create New List
            </h3>
            <input
              type='text'
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder='List Name'
              className='input text-accent-content input-bordered w-full max-w-xs transition-transform duration-300 ease-in-out transform hover:scale-105 focus:scale-105'
            />
            <button
              className='btn btn-primary w-full max-w-xs transition-transform duration-300 ease-in-out transform hover:scale-105 focus:scale-105'
              onClick={handleCreateList}>
              Create
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
};

export default Sidebar;
