import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const ProtectedRoute = ({ element, isProfileRoute = false }) => {
  const { user, setShowUserLogin } = useAppContext();
  
  useEffect(() => {
    if (!user) {
      if (isProfileRoute) {
        toast.error('Please login to continue');
      }
      setShowUserLogin(true);
    }
  }, [user, isProfileRoute, setShowUserLogin]);
  
  return user ? element : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ element }) => {
  const { user } = useAppContext();
  
  return user ? <Navigate to="/" replace /> : element;
}; 

export const SellerProtectedRoute = ({ element, isSeller }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};