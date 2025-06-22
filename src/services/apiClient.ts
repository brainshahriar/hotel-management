import axios, { AxiosInstance } from 'axios';

// Create an Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://walc.dotprogrammers.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // Only add authorization header to protected routes (/admin/*)
    const isProtectedRoute = config.url?.includes('/admin/');
    const token = localStorage.getItem('auth_token');
    
    if (token && isProtectedRoute) {
      console.log('Adding auth token to protected route:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isProtectedRoute) {
      console.log('Warning: No auth token available for protected route:', config.url);
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
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.message);
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 Unauthorized error - clearing auth token');
      
      // If refresh token functionality is implemented, it would go here
      // For now, redirect to login page
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_time');
      
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
