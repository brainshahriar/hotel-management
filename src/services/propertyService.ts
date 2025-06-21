import { Property } from '../types/models';
import apiClient from './apiClient';

export const PropertyService = {
  // Public Routes
  // Get all properties with pagination
  getAll: async (perPage: number = 10) => {
    const response = await apiClient.get(`/properties`, {
      params: { per_page: perPage }
    });
    return response.data;
  },

  // Get a single property by ID (public)
  getById: async (id: number) => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  // Create a new property
  create: async (propertyData: any) => {
    // Map the frontend property data to match the backend fields
    const mappedProperty = {
      title: propertyData.title,
      category: propertyData.category,
      featured: propertyData.featured || false,
      description: propertyData.description,
      rating: propertyData.rating,
      location: propertyData.location,
      price: propertyData.price || 0,
      price_type: propertyData.price_type || 'nightly',
      room_count: propertyData.room_count || 0,
      capacity: propertyData.capacity || 0,
      amenities: propertyData.amenities || [],
      highlights: propertyData.highlights || [],
      lat: propertyData.lat || 0,
      lon: propertyData.lon || 0,
      date: propertyData.date || new Date().toISOString().split('T')[0],
      image_path: propertyData.image_path || '',
      // Ensure policies includes check_in_time and check_out_time
      policies: {
        ...(propertyData.policies || {}),
        check_in_time: propertyData.policies?.check_in_time || '14:00-22:00',
        check_out_time: propertyData.policies?.check_out_time || '11:00',
      },
      // Ensure check_in_options is formatted correctly
      check_in_options: {
        time_range: propertyData.policies?.check_in_time || '14:00-22:00',
        early_check_in: propertyData.check_in_options?.early_check_in || false,
        early_check_in_fee: propertyData.check_in_options?.early_check_in_fee || 0
      },
      // Ensure check_out_options is formatted correctly
      check_out_options: {
        time: propertyData.policies?.check_out_time || '11:00',
        late_check_out: propertyData.check_out_options?.late_check_out || false,
        late_check_out_fee: propertyData.check_out_options?.late_check_out_fee || 0
      },
      min_stay_nights: propertyData.min_stay_nights || 1,
      property_surroundings: propertyData.property_surroundings || {},
      house_rules: propertyData.house_rules || [],
    };
    
    const response = await apiClient.post(`/admin/properties`, mappedProperty);
    return response.data;
  },
  
  // Update an existing property
  update: async (id: number, property: Partial<Property>) => {
    const response = await apiClient.post(`/admin/properties/${id}`, property);
    return response.data;
  },
  
  // Delete a property
  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/properties/${id}`);
    return response.data;
  }
};

export default PropertyService;
