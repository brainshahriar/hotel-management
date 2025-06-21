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
  }
};

export default BookingService;
