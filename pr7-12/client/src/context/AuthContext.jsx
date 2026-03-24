// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    try {
      const userData = await auth.getMe();
      console.log('User data from server:', userData); // для отладки
      setUser(userData);
      setUserRole(userData.role);
    } catch (error) {
      console.error('Auth check failed:', error);
      auth.logout();
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (username, password) => {
    await auth.login(username, password);
    await checkAuth();
  };
  
  const register = async (username, password, role = 'user') => {
    return await auth.register(username, password, role);
  };
  
  const logout = () => {
    auth.logout();
    setUser(null);
    setUserRole(null);
  };
  
  const isAuthenticated = !!user;
  
  // Правильное определение ролей
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const isUser = userRole === 'user';
  
  // Права доступа
  const canEditProducts = isSeller || isAdmin;  // продавец и админ могут редактировать
  const canDeleteProducts = isAdmin;             // только админ может удалять
  const canManageUsers = isAdmin;                // только админ может управлять пользователями
  const canCreateProducts = isSeller || isAdmin; // продавец и админ могут создавать
  
  // Текст роли для отображения
  const getRoleText = () => {
    if (isAdmin) return 'Администратор';
    if (isSeller) return 'Продавец';
    return 'Пользователь';
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole,
      login, 
      register, 
      logout, 
      isAuthenticated, 
      loading,
      isAdmin,
      isSeller,
      isUser,
      canEditProducts,
      canDeleteProducts,
      canManageUsers,
      canCreateProducts,
      getRoleText
    }}>
      {children}
    </AuthContext.Provider>
  );
};