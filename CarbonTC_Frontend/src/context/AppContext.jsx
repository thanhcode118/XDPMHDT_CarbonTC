import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState({
    name: 'Nguyễn Văn An',
    role: 'Chủ xe điện',
    avatar: 'https://picsum.photos/seed/user123/40/40.jpg'
  });
  const [notifications, setNotifications] = useState(3);

  const value = {
    currentPage,
    setCurrentPage,
    user,
    setUser,
    notifications,
    setNotifications
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};