import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div className='modal modal-open modal-bottom sm:modal-middle'>
      <div className='modal-box relative min-w-[300px] min-h-[200px] shadow-xl text-white transition-all duration-1000 ease-in-out transform scale-90 hover:scale-100'>
        <button
          className='btn btn-sm btn-circle absolute right-2 top-2'
          onClick={onClose}>
          ✕
        </button>
        <div className='text-center'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
