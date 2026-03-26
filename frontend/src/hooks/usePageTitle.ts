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
    
    document.title = title;
  }, [location.pathname]);
};
