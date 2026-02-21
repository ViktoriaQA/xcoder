export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  },
  auth: {
    tokenKey: 'auth_token',
    userKey: 'auth_user',
  }
};
