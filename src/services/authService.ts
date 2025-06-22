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
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Explicitly set the Authorization header for the logout request
        await apiClient.post('/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Logout API request successful');
      } else {
        console.warn('No auth token found when attempting to logout');
      }
    } catch (error) {
      console.error('Logout API request failed:', error);
      // Continue with client-side logout even if API request fails
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_time');
      console.log('Local auth data cleared');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

export default AuthService;
