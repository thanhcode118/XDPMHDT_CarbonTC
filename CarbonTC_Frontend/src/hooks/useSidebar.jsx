import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarActive, setSidebarActive] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarActive(true);
      } else {
        setSidebarActive(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return {
    isMobile,
    sidebarActive,
    toggleSidebar
  };
};