import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  const navigate = useNavigate();

  const logout = () => {
    ctx.logout();
    navigate('/login');
  };

  return {
    isAuthenticated: ctx.isAuthenticated,
    userRole: ctx.userRole,
    isAdmin: ctx.isAdmin,
    login: ctx.login,
    logout,
  };
};
