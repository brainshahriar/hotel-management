import apiClient from "./apiClient";

export const AuthService = {
  // Refresh token method
  refreshToken: async (refreshToken: string) => {
    try {
      console.log("Attempting to refresh token...");
      const response = await apiClient.post("/refresh", {
        refresh_token: refreshToken,
      });
      console.log("Refresh token response:", response.data);

      // The backend returns access_token and refresh_token directly
      // But for backwards compatibility, check multiple formats
      const newToken =
        response.data.access_token ||
        response.data.token ||
        (response.data.data && response.data.data.token);

      // Extract the new refresh token if provided
      const newRefreshToken =
        response.data.refresh_token ||
        (response.data.data && response.data.data.refresh_token);

      if (newToken) {
        console.log("Storing new auth token from refresh");
        localStorage.setItem("auth_token", newToken);

        // If a new refresh token is provided, store it too
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update login timestamp
        localStorage.setItem("auth_time", new Date().toISOString());
        return {
          success: true,
          token: newToken,
          refresh_token: newRefreshToken,
        };
      } else {
        console.error("No token found in refresh response:", response.data);
        return {
          success: false,
          message: "Failed to extract token from refresh response",
        };
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return {
        success: false,
        error,
        message: "Token refresh failed",
      };
    }
  },

  // Login and get token
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/login", { email, password });
    console.log("Login API response:", response.data);
    // Check if token is in the expected location
    // API returns access_token but check other formats for backward compatibility
    const token =
      response.data.access_token ||
      response.data.token ||
      (response.data.data && response.data.data.token);

    // Extract refresh token if available
    const refreshToken =
      response.data.refresh_token ||
      (response.data.data && response.data.data.refresh_token);

    if (token) {
      console.log("Storing auth token:", token);
      localStorage.setItem("auth_token", token);

      // Store refresh token if available
      if (refreshToken) {
        console.log("Storing refresh token");
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Also store a timestamp for when the user logged in
      localStorage.setItem("auth_time", new Date().toISOString());
    } else {
      console.error("No token found in response:", response.data);
    }

    return response.data;
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },
  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // Explicitly set the Authorization header for the logout request
        await apiClient.post(
          "/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Logout API request successful");
      } else {
        console.warn("No auth token found when attempting to logout");
      }
    } catch (error) {
      console.error("Logout API request failed:", error);
      // Continue with client-side logout even if API request fails
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_time");
      console.log("Local auth data cleared");
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token");
  },
};

export default AuthService;
