import { Room } from '../types/models';
import apiClient from './apiClient';

export const RoomService = {
  // Get all rooms for a property
  getAllForProperty: async (propertyId: number) => {
    const response = await apiClient.get(`/admin/properties/${propertyId}/rooms`);
    return response.data;
  },
  
  // Get a single room
  getById: async (propertyId: number, roomId: number) => {
    const response = await apiClient.get(`/admin/properties/${propertyId}/rooms/${roomId}`);
    return response.data;
  },
    // Create a new room for a property
  create: async (propertyId: number, roomData: any) => {
    // Map the frontend room data to match the backend fields
    const mappedRoom = {
      name: roomData.name,
      room_type: roomData.room_type || roomData.type || 'Standard',
      description: roomData.description,
      total_rooms: roomData.total_rooms || 1,
      price: roomData.price || roomData.base_price || 0,
      max_adults: roomData.max_adults || roomData.capacity || 2,
      max_children: roomData.max_children || 0,
      max_infants: roomData.max_infants || 0,
      breakfast_included: roomData.breakfast_included || false,
      free_cancellation: roomData.free_cancellation || false,
      amenities: roomData.amenities || [],
      size_sqm: roomData.size_sqm || roomData.size || 0,
      bed_type: roomData.bed_type || 'Queen',
      image_path: roomData.image_path || roomData.thumbnail || '',
    };
    
    const response = await apiClient.post(`/admin/properties/${propertyId}/rooms`, mappedRoom);
    return response.data;
  },
    // Update an existing room
  update: async (propertyId: number, roomId: number, roomData: Partial<Room>) => {
    // Map the frontend room data to match the backend fields
    const mappedRoom = {
      name: roomData.name,
      room_type: roomData.room_type,
      description: roomData.description,
      total_rooms: roomData.total_rooms,
      price: roomData.price,
      max_adults: roomData.max_adults,
      max_children: roomData.max_children,
      max_infants: roomData.max_infants,
      breakfast_included: roomData.breakfast_included,
      free_cancellation: roomData.free_cancellation,
      amenities: roomData.amenities,
      size_sqm: roomData.size_sqm,
      bed_type: roomData.bed_type,
      image_path: roomData.image_path,
    };
    
    const response = await apiClient.post(`/admin/properties/${propertyId}/rooms/${roomId}`, mappedRoom);
    return response.data;
  },
  
  // Delete a room
  delete: async (propertyId: number, roomId: number) => {
    const response = await apiClient.delete(`/admin/properties/${propertyId}/rooms/${roomId}`);
    return response.data;
  },
  
  // Upload room images
  uploadImages: async (propertyId: number, roomId: number, formData: FormData) => {
    const response = await apiClient.post(
      `/admin/properties/${propertyId}/rooms/${roomId}/images`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
};

export default RoomService;
