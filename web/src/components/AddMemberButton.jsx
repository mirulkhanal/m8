import { useState } from 'react';
import { useListStore } from '../store/useListStore';
import SearchFriends from './SearchFriends';
import Modal from './Modal';

export const AddMemberButton = ({ listId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { inviteMember } = useListStore();

  const handleAddMember = async (userId) => {
    try {
      await inviteMember(userId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className='w-full mb-4'>
        Add Member
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Add Member'>
        <SearchFriends onFriendSelect={handleAddMember} />
      </Modal>
    </>
  );
};
