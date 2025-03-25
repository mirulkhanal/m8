import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useListStore } from '../store/useListStore';

const ListItemForm = () => {
  const { addItem } = useListStore();
  const [itemContent, setItemContent] = useState('');

  const handleAddItem = () => {
    if (itemContent.trim()) {
      addItem(itemContent);
      setItemContent('');
    }
  };

  return (
    <div className='sticky bottom-0 p-4 bg-base-100/95 backdrop-blur-lg border-t border-base-300 shadow-lg'>
      <div className='flex gap-2'>
        <input
          type='text'
          value={itemContent}
          onChange={(e) => setItemContent(e.target.value)}
          placeholder='Add new item...'
          className='input input-bordered flex-1 bg-base-100 shadow-inner hover:shadow-md transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary/50 focus:shadow-lg focus:scale-[1.02] placeholder:text-base-content/50'
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <button
          onClick={handleAddItem}
          className='btn btn-primary gap-2 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:-translate-y-0.5'>
          <Plus className='w-4 h-4' />
          Add
        </button>
      </div>
    </div>
  );
};

export default ListItemForm;
