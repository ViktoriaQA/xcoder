import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'Xcode',
  '/auth': 'Auth',
  '/tournaments': 'Tournaments',
  '/tasks': 'Tasks',
  '/dashboard': 'Dashboard',
  '/subscription': 'Subscription',
  '/profile': 'Profile',
  '/my-tournaments': 'My Tournaments',
  '/progress': 'Progress',
  '/rating': 'Rating',
  '/certificates': 'Certificates',
  '/students': 'Students',
  '/analytics': 'Analytics',
  '/admin': 'Admin',
  '/admin/tournaments': 'Admin Tournaments',
  '/admin/settings': 'Admin Settings',
  '/admin/subscriptions': 'Admin Subscriptions',
  '/admin/users': 'Admin Users',
  '/admin/session-cleaner': 'Session Cleaner',
  '/contract': 'Contract Offer',
};

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    console.log('🔍 usePageTitle: Path changed to:', currentPath);
    
    // Handle dynamic routes
    let title = routeTitles[currentPath];
    
    // Handle tournament-specific routes
    if (currentPath.startsWith('/tournaments/') && currentPath !== '/tournaments') {
      title = 'Tournaments';
    }
    
    // Handle task-specific routes
    if (currentPath.startsWith('/tasks/') && currentPath !== '/tasks') {
      title = 'Tasks';
    }
    
    // Default fallback
    if (!title) {
      title = 'Xcode';
    }
    
    console.log('🎯 usePageTitle: Setting title to:', title);
    
    // Function to force update title
    const updateTitle = () => {
      const currentTitle = document.title;
      if (currentTitle !== title) {
        console.log('🔄 usePageTitle: Changing title from', currentTitle, 'to', title);
        document.title = title;
      } else {
        console.log('✅ usePageTitle: Title already correct:', title);
      }
    };
    
    // Set title immediately
    updateTitle();
    
    // Set title after various delays
    const timeout1 = setTimeout(updateTitle, 50);
    const timeout2 = setTimeout(updateTitle, 200);
    const timeout3 = setTimeout(updateTitle, 500);
    
    // Use MutationObserver to detect and fix title changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && document.title !== title) {
          console.log('🚨 usePageTitle: Title changed by external source, fixing...');
          updateTitle();
        }
      });
    });
    
    // Observe the title element
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
    }
    
    // Also check periodically for first few seconds
    const interval = setInterval(() => {
      updateTitle();
    }, 100);
    
    // Clear all timers and observer after 3 seconds
    const clearAll = setTimeout(() => {
      clearInterval(interval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(clearAll);
      observer.disconnect();
      console.log('🛑 usePageTitle: Cleanup completed');
    }, 3000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(clearAll);
      clearInterval(interval);
      observer.disconnect();
    };
  }, [location.pathname]);
};
