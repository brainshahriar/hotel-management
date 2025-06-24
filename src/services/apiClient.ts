import axios, { AxiosInstance } from 'axios';

// Create an Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://walcapi.afritech54.agency/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {    // Define protected routes - admin routes and other protected endpoints
    const protectedRoutes = [
      '/admin/',
      '/logout',
      '/users',
      '/profile'
    ];
    
    // Define explicitly public routes that should never include auth token
    const publicRoutes = [
      '/properties',
      '/refresh',  // The refresh endpoint should not include the auth token as it's used to get a new one
    ];
    
    // Check if the current URL is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      config.url?.includes(route)
    );
    
    // Check if the current URL is explicitly a public route
    const isPublicRoute = publicRoutes.some(route => {
      // Check if it's an exact public route match or a public route with an ID parameter
      // For example, /properties/123 should match /properties in our publicRoutes array
      if (config.url) {
        const urlParts = config.url.split('/');
        const routeParts = route.split('/');
        
        // Match the first part (e.g., 'properties' in '/properties/123')
        return urlParts[1] === routeParts[1]; // assuming routeParts[0] is '' due to leading slash
      }
      return false;
    });
    
    const token = localStorage.getItem('auth_token');
    
    // Only include the token for protected routes or non-public routes
    if (token && (isProtectedRoute || !isPublicRoute)) {
      if (isProtectedRoute) {
        console.log('Adding auth token to protected route:', config.url);
      } else {
        console.log('Adding auth token to request:', config.url);
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isProtectedRoute && !token) {
      console.warn('Warning: No auth token available for protected route:', config.url);
    } else {
      console.log('Public route accessed, no auth token needed:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    // For login responses, check if they contain a token and log it
    if (response.config.url?.includes('/login') || response.config.url?.includes('/oauth/token')) {
      console.log('Login response received:', response.data);
      
      // Check if there's a token in the response for debugging
      const token = response.data.token || 
                    (response.data.data && response.data.data.token) || 
                    response.data.access_token;
      console.log('Token found in response:', !!token);
    }
    return response;
  },  async (error) => {
    console.error('Response error:', error.response?.status, error.message);
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 Unauthorized error - attempting to refresh token');
      
      // Check if we have a refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Attempt to refresh the token
      if (refreshToken && !originalRequest.url?.includes('/refresh')) {
        try {
          // Import AuthService using require to avoid circular dependency
          const AuthService = require('./authService').default;
          
          // Try to refresh the token
          console.log('Attempting to refresh the access token...');
          const refreshResult = await AuthService.refreshToken(refreshToken);
          
          if (refreshResult.success && refreshResult.token) {
            console.log('Token refreshed successfully, retrying original request');
            
            // Update the Authorization header with the new token
            originalRequest.headers.Authorization = `Bearer ${refreshResult.token}`;
            
            // Retry the original request with the new token
            return apiClient(originalRequest);
          } else {
            console.error('Token refresh failed, redirecting to login');
          }
        } catch (refreshError) {
          console.error('Error during token refresh:', refreshError);
        }
      }
      
      // If refresh token is not available or refresh failed, proceed with logout
      console.log('No refresh token available or refresh failed - clearing auth data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_time');
      
      // Don't redirect if this is a logout request or if already on login page
      const isLogoutRequest = originalRequest.url?.includes('/logout');
      if (!window.location.pathname.includes('/login') && !isLogoutRequest) {
        console.log('Redirecting to login page after auth failure');
        window.location.href = '/login';
      } else if (isLogoutRequest) {
        console.log('Ignoring 401 error during logout process');
      }
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
