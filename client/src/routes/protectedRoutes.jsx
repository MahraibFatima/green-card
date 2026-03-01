import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const ProtectedRoute = ({ element }) => {
  const { user } = useAppContext();
  
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