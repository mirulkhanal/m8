import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendStore } from '../store/useFriendStore';
import { Link } from 'react-router-dom';
import {
  Handshake,
  LogOut,
  Settings,
  User,
  Users,
  ListTodo,
} from 'lucide-react';
import { useListStore } from '../store/useListStore';
const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { friendRequests, loadFriendRequests } = useFriendStore();
  const { listInvites, loadListInvites } = useListStore();

  // Load notifications data when navbar mounts
  useEffect(() => {
    if (authUser) {
      loadFriendRequests();
      loadListInvites();
    }
  }, [authUser, loadFriendRequests, loadListInvites]);

  // Calculate total notifications
  const totalNotifications =
    (friendRequests?.length || 0) + (listInvites?.length || 0);

  return (
    <header className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blue-lg bg-base-100/80'>
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex items-center gap-2.5 hover:opacity-80 transition-all'>
              <div className='size-9 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Handshake className='w-5 h-5 text-primary' />
              </div>
              <h1 className='text-lg font-bold'>M8</h1>
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            {authUser && (
              <>
                <Link to='/' className='btn btn-sm gap-2'>
                  <ListTodo className='size-5' />
                  <span className='hidden sm:inline'>Lists</span>
                </Link>
                <Link to='/friends' className='btn btn-sm gap-2 relative'>
                  <Users className='size-5' />
                  <span className='hidden sm:inline'>Friends</span>
                  {friendRequests?.length > 0 && (
                    <div className='absolute -top-2 -right-2 bg-primary text-primary-content rounded-full size-5 flex items-center justify-center text-xs font-bold'>
                      {friendRequests.length}
                    </div>
                  )}
                </Link>
                <Link to='/list-invites' className='btn btn-sm gap-2 relative'>
                  <ListTodo className='size-5' />
                  <span className='hidden sm:inline'>Invites</span>
                  {listInvites?.length > 0 && (
                    <div className='absolute -top-2 -right-2 bg-primary text-primary-content rounded-full size-5 flex items-center justify-center text-xs font-bold'>
                      {listInvites.length}
                    </div>
                  )}
                </Link>
                <Link to='/profile' className='btn btn-sm gap-2'>
                  <User className='size-5' />
                  <span className='hidden sm:inline'>Profile</span>
                </Link>
                <Link
                  to={'/settings'}
                  className='btn btn-sm gap-2 transition-colors'>
                  <Settings className='size-4' />
                  <span className='hidden sm:inline'>Settings</span>
                </Link>
                <button className='flex gap-2 items-center' onClick={logout}>
                  <LogOut className='size-5' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
