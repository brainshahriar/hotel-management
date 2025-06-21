import apiClient from './apiClient';

export const AuthService = {  // Login and get token
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    console.log('Login API response:', response.data);
    
    // Check if token is in the expected location
    // Sometimes token might be nested in data.data or data.token or just data
    const token = response.data.token || 
                  (response.data.data && response.data.data.token) || 
                  (response.data.access_token);
    
    if (token) {
      console.log('Storing auth token:', token);
      localStorage.setItem('auth_token', token);
      // Also store a timestamp for when the user logged in
      localStorage.setItem('auth_time', new Date().toISOString());
    } else {
      console.error('No token found in response:', response.data);
    }
    
    return response.data;
  },
  
  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  // Logout
  logout: async () => {
    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

export default AuthService;
