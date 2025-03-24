import Sidebar from '../components/Sidebar';
import NoListSelected from '../components/NoListSelected';
import { useListStore } from '../store/useListStore';
import ListView from '../components/ListView';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const HomePage = () => {
  const { selectedList, loadUserLists } = useListStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    const fetchData = async () => {
      await loadUserLists();
    };
    fetchData();
  }, [authUser]);

  return (
    <div className='h-screen bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar />
            {!selectedList ? <NoListSelected /> : <ListView />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
