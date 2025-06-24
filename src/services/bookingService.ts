import { Booking } from '../types/models';
import apiClient from './apiClient';

export const BookingService = {
  // Get all bookings with pagination
  getAll: async (page: number = 1, perPage: number = 10) => {
    const response = await apiClient.get(`/admin/bookings`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },
  
  // Get bookings for a specific property
  getForProperty: async (propertyId: number, page: number = 1, perPage: number = 10) => {
    const response = await apiClient.get(`/admin/properties/${propertyId}/bookings`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },
  
  // Get bookings for a specific room
  getForRoom: async (propertyId: number, roomId: number, page: number = 1, perPage: number = 10) => {
    const response = await apiClient.get(`/admin/properties/${propertyId}/rooms/${roomId}/bookings`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },
  
  // Get a single booking
  getById: async (id: number) => {
    const response = await apiClient.get(`/admin/bookings/${id}`);
    return response.data;
  },
  
  // Create a new booking
  create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post(`/admin/bookings`, booking);
    return response.data;
  },
  
  // Update an existing booking
  update: async (id: number, booking: Partial<Booking>) => {
    const response = await apiClient.put(`/admin/bookings/${id}`, booking);
    return response.data;
  },
    // Cancel a booking
  cancel: async (id: number, reason: string) => {
    const response = await apiClient.put(`/admin/bookings/${id}/cancel`, { reason });
    return response.data;
  },
  
  // Get booking summary for dashboard
  getSummary: async () => {
    try {
      const response = await apiClient.get('/admin/bookings/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking summary:', error);
      // Return mock summary data
      return {
        status: true,
        data: {
          total: 128,
          pending: 18,
          confirmed: 85,
          cancelled: 12,
          completed: 13,
          todayArrivals: 5,
          todayDepartures: 3,
          revenue: {
            total: 142500.00,
            monthly: 32650.00,
            weekly: 9850.00
          },
          recentBookings: [
            {
              id: 1001,
              guestName: 'John Doe',
              property: 'Seaside Resort',
              checkIn: '2025-06-25',
              status: 'confirmed'
            },
            {
              id: 1002,
              guestName: 'Jane Smith',
              property: 'Mountain Lodge',
              checkIn: '2025-07-10',
              status: 'pending'
            },
            {
              id: 1003,
              guestName: 'Robert Johnson',
              property: 'City Center Hotel',
              checkIn: '2025-06-18',
              status: 'cancelled'
            },
            {
              id: 1004,
              guestName: 'Maria Garcia',
              property: 'Seaside Resort',
              checkIn: '2025-07-05',
              status: 'confirmed'
            },
            {
              id: 1005,
              guestName: 'David Wilson',
              property: 'Mountain Lodge',
              checkIn: '2025-08-15',
              status: 'confirmed'
            }
          ]
        }
      };
    }
  }
};

export default BookingService;
