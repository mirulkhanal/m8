import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useListStore } from '../store/useListStore';

const ListItemForm = () => {
  const { addItem } = useListStore();
  const [itemName, setItemName] = useState(''); // Renamed from itemContent for clarity
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');

  const handleAddItem = () => {
    if (itemName.trim()) {
      // Package grocery details into metadata
      const metadata = {
        quantity: quantity.trim() || null, // Store null if empty
        unit: unit.trim() || null,
        category: category.trim() || null,
      };
      // Pass itemName as content, and the constructed metadata object
      addItem(itemName.trim(), metadata);
      // Reset form fields
      setItemName('');
      setQuantity('');
      setUnit('');
      setCategory('');
    } else {
      // Optionally show a toast or validation message
      console.warn('Item name cannot be empty');
    }
  };

  return (
    <div className='sticky bottom-0 p-4 bg-base-100/95 backdrop-blur-lg border-t border-base-300 shadow-lg'>
      {/* Input for Item Name (Content) */}
      <div className='flex gap-2 mb-2'>
        <input
          type='text'
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder='Add new item (e.g., Apples)'
          className='input input-bordered flex-1 bg-base-100 shadow-inner hover:shadow-md transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary/50 focus:shadow-lg focus:scale-[1.02] placeholder:text-base-content/50'
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()} // Allow Enter on main input
        />
        <button
          onClick={handleAddItem}
          className='btn btn-primary gap-2 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:-translate-y-0.5'>
          <Plus className='w-4 h-4' />
          Add
        </button>
      </div>
      {/* Inputs for Metadata (Grocery Specific) */}
      <div className='grid grid-cols-3 gap-2'>
        <input
          type='text'
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder='Qty (e.g., 2)'
          className='input input-sm input-bordered bg-base-100 shadow-inner placeholder:text-base-content/50'
        />
        <input
          type='text'
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder='Unit (e.g., kg, pack)'
          className='input input-sm input-bordered bg-base-100 shadow-inner placeholder:text-base-content/50'
        />
        <input
          type='text'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder='Category (e.g., Fruit)'
          className='input input-sm input-bordered bg-base-100 shadow-inner placeholder:text-base-content/50'
        />
      </div>
    </div>
  );
};

export default ListItemForm;
