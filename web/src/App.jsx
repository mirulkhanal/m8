import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Settings from './pages/Settings.jsx';
import Friends from './pages/Friends.jsx';
import ListInvites from './pages/ListInvites.jsx';
import Navbar from './components/Navbar.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore.js';
import { useSocketStore } from './store/useSocketStore';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { initUserSocket, disconnectSockets } = useSocketStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Initialize socket when user is authenticated
  useEffect(() => {
    if (authUser) {
      initUserSocket(authUser.id);
    } else {
      disconnectSockets();
    }
    
    return () => {
      disconnectSockets();
    };
  }, [authUser, initUserSocket, disconnectSockets]);
  
  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className=''></Loader>
      </div>
    );
  }
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={authUser ? <Homepage /> : <Navigate to={'/login'} />}
        />
        <Route
          path='/profile'
          element={authUser ? <Profile /> : <Navigate to={'/login'} />}
        />
        <Route
          path='/friends'
          element={authUser ? <Friends /> : <Navigate to={'/login'} />}
        />
        <Route
          path='/login'
          element={!authUser ? <Login /> : <Navigate to={'/'} />}
        />
        <Route
          path='/signup'
          element={!authUser ? <Signup /> : <Navigate to={'/'} />}
        />
        <Route
          path='/settings'
          element={authUser ? <Settings /> : <Navigate to={'/login'} />}
        />
        <Route
          path='/list-invites'
          element={authUser ? <ListInvites /> : <Navigate to={'/login'} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
