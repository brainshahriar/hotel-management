import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';

// Lazy load pages for better performance
const Login = React.lazy(() => import('../pages/Login'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const PropertyList = React.lazy(() => import('../pages/properties/PropertyList'));
const PropertyDetail = React.lazy(() => import('../pages/properties/PropertyDetail'));
const PropertyCreate = React.lazy(() => import('../pages/properties/PropertyCreate'));
const PropertyEdit = React.lazy(() => import('../pages/properties/PropertyEdit'));
const RoomList = React.lazy(() => import('../pages/rooms/RoomList'));
const RoomDetail = React.lazy(() => import('../pages/rooms/RoomDetail'));
const RoomCreate = React.lazy(() => import('../pages/rooms/RoomCreate'));
const RoomEdit = React.lazy(() => import('../pages/rooms/RoomEdit'));
const Availability = React.lazy(() => import('../pages/availability/Availability'));
const BookingManagement = React.lazy(() => import('../pages/bookings'));
const BookingDetail = React.lazy(() => import('../pages/bookings/BookingDetail'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Auth guard component for protected routes
const ProtectedRoute = ({ children }: { children: ReactNode }): React.ReactElement => {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = token !== null && token !== '';

  console.log('ProtectedRoute check - Auth token exists:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  // Wrap children in a fragment to ensure we always return a single React element
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes with dashboard layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />

            {/* Properties routes */}
            <Route path="properties">
              <Route index element={<PropertyList />} />
              <Route path="new" element={<PropertyCreate />} />
              <Route path=":propertyId" element={<PropertyDetail />} />
              <Route path=":propertyId/edit" element={<PropertyEdit />} />

              {/* Rooms routes - nested under properties */}
              <Route path=":propertyId/rooms">
                <Route index element={<RoomList />} />
                <Route path="new" element={<RoomCreate />} />
                <Route path=":roomId" element={<RoomDetail />} />
                <Route path=":roomId/edit" element={<RoomEdit />} />

                {/* Availability route */}
                <Route path=":roomId/availability" element={<Availability />} />
              </Route>
            </Route>
            {/* Bookings routes */}
            <Route path="bookings">
              <Route index element={<BookingManagement />} />
              <Route path=":id" element={<BookingDetail />} />
            </Route>
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
