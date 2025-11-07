import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const NotificationComponent = () => {
    if (!notification) return null;

    const notificationClass = `alert alert-${notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'} position-fixed top-0 end-0 m-3`;
    
    return (
      <div className={notificationClass} style={{ zIndex: 9999 }}>
        <div className="d-flex align-items-center">
          <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : notification.type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2`}></i>
          {notification.message}
        </div>
      </div>
    );
  };

  return {
    showNotification,
    NotificationComponent
  };
};