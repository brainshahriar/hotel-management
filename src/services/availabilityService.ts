import { RoomAvailability } from '../types/models';
import apiClient from './apiClient';
import { format } from 'date-fns';

export const AvailabilityService = {
  // Get availability for a room in a date range
  getForDateRange: async (propertyId: number, roomId: number, startDate: string, endDate: string) => {
    const response = await apiClient.get(`/admin/properties/${propertyId}/rooms/${roomId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
    // Update availability for a single date
  updateForDate: async (
    propertyId: number, 
    roomId: number, 
    date: string, 
    data: {
      available_rooms?: number;
      price_modifier?: number;
      closed?: boolean;
    }
  ) => {
    // Create the dates array with the single date
    const payload = {
      dates: [
        {
          date,
          available_rooms: data.available_rooms,
          price_modifier: data.price_modifier,
          closed: data.closed
        }
      ]
    };
    
    const response = await apiClient.post(`/admin/properties/${propertyId}/rooms/${roomId}/availability`, payload);
    return response.data;
  },
    // Bulk update availability for a date range
  bulkUpdate: async (
    propertyId: number, 
    roomId: number, 
    startDate: string, 
    endDate: string, 
    data: {
      available_rooms?: number;
      price_modifier?: number;
      closed?: boolean;
    }
  ) => {
    // Generate dates array from start date to end date
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push({
        date: format(d, 'yyyy-MM-dd'),
        available_rooms: data.available_rooms,
        price_modifier: data.price_modifier,
        closed: data.closed
      });
    }
    
    const payload = { dates };
    
    const response = await apiClient.post(
      `/admin/properties/${propertyId}/rooms/${roomId}/availability`,
      payload
    );
    return response.data;
  },
  
  // Close room for a date range
  closeForDateRange: async (
    propertyId: number, 
    roomId: number, 
    startDate: string, 
    endDate: string, 
    reason: string
  ) => {
    const response = await apiClient.put(
      `/admin/properties/${propertyId}/rooms/${roomId}/close`,
      {
        start_date: startDate,
        end_date: endDate,
        closed_reason: reason,
        is_closed: true
      }
    );
    return response.data;
  },
  
  // Open room for a date range
  openForDateRange: async (
    propertyId: number, 
    roomId: number, 
    startDate: string, 
    endDate: string
  ) => {
    const response = await apiClient.put(
      `/admin/properties/${propertyId}/rooms/${roomId}/close`,
      {
        start_date: startDate,
        end_date: endDate,
        is_closed: false
      }
    );
    return response.data;
  }
};

export default AvailabilityService;
