export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regex patterns for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  // Check user agent
  if (mobileRegex.test(userAgent)) return true;
  
  // Check screen width (fallback)
  if (window.innerWidth <= 768) return true;
  
  // Check touch support
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return true;
  
  return false;
};
