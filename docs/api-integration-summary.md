# Hotel Dashboard API Integration Summary

This document summarizes the changes made to ensure proper API integration between the frontend React dashboard and the backend Laravel API.

## Backend Models

### Property Model
```php
protected $fillable = [
    'title',
    'category',
    'featured',
    'description',
    'rating',
    'location',
    'price',
    'price_type',
    'room_count',
    'capacity',
    'amenities',
    'highlights',
    'lat',
    'lon',
    'date',
    'image_path',
    'policies',
    'check_in_options',
    'check_out_options',
    'min_stay_nights',
    'property_surroundings',
    'house_rules',
];
```

### Room Model
```php
protected $fillable = [
    'property_id',
    'name',
    'room_type',
    'description',
    'total_rooms',
    'price',
    'max_adults',
    'max_children',
    'max_infants',
    'breakfast_included',
    'free_cancellation',
    'amenities',
    'size_sqm',
    'bed_type',
    'image_path',
];
```

### RoomAvailability Model
```php
protected $fillable = [
    'room_id',
    'date',
    'available_rooms',
    'price_modifier',
    'closed',
];
```

## Frontend TypeScript Models

The TypeScript models have been updated to match the backend models:

### Property Interface
```typescript
export interface Property {
  id: number;
  title: string;
  category: string;
  featured: boolean;
  description: string;
  rating: number;
  location: string;
  price: number;
  price_type: string;
  room_count: number;
  capacity: number;
  amenities: string[];
  highlights: string[];
  lat: number;
  lon: number;
  date: string;
  image_path: string;
  image_url?: string;
  policies: {
    cancellation?: string;
    payment?: string;
    other?: string;
  };
  check_in_options: string[];
  check_out_options: string[];
  min_stay_nights: number;
  property_surroundings: {
    nearby_attractions?: string[];
    transportation?: string[];
    airports?: string[];
  };
  house_rules: string[];
  created_at: string;
  updated_at: string;
  rooms?: Room[];
  gallery_images?: PropertyGalleryImage[];
}
```

### Room Interface
```typescript
export interface Room {
  id: number;
  property_id: number;
  name: string;
  room_type: string;
  description: string;
  total_rooms: number;
  price: number;
  max_adults: number;
  max_children: number;
  max_infants: number;
  breakfast_included: boolean;
  free_cancellation: boolean;
  amenities: string[];
  size_sqm: number;
  bed_type: string;
  image_path: string;
  image_url?: string;
  available_rooms_count?: number;
  created_at: string;
  updated_at: string;
  availability?: RoomAvailability[];
}
```

### RoomAvailability Interface
```typescript
export interface RoomAvailability {
  id: number;
  room_id: number;
  date: string;
  available_rooms: number;
  price_modifier: number;
  closed: boolean;
  created_at: string;
  updated_at: string;
}
```

## Form Field Mappings

### Property Create Form
- Backend: `title` → Frontend: `title` (previously `name`)
- Backend: `category` → Frontend: `category` (previously `type`)
- Backend: `description` → Frontend: `description`
- Backend: `rating` → Frontend: `rating` (previously `star_rating`)
- Backend: `location` → Frontend: `location` (combined from `address`, `city`, etc.)
- Backend: `featured` → Frontend: `featured`

### Room Create Form
- Backend: `name` → Frontend: `name`
- Backend: `room_type` → Frontend: `room_type`
- Backend: `description` → Frontend: `description`
- Backend: `total_rooms` → Frontend: `total_rooms`
- Backend: `price` → Frontend: `price` (previously `base_price`)
- Backend: `max_adults` → Frontend: `max_adults` (previously `capacity`)
- Backend: `max_children` → Frontend: `max_children`
- Backend: `max_infants` → Frontend: `max_infants`
- Backend: `breakfast_included` → Frontend: `breakfast_included`
- Backend: `free_cancellation` → Frontend: `free_cancellation`
- Backend: `amenities` → Frontend: `amenities`
- Backend: `size_sqm` → Frontend: `size_sqm` (previously `size`)
- Backend: `bed_type` → Frontend: `bed_type`
- Backend: `image_path` → Frontend: `image_path` (previously `thumbnail`)

### Room Availability Form
- Backend: `available_rooms` → Frontend: `available_rooms`
- Backend: `price_modifier` → Frontend: `price_modifier` (previously `price`)
- Backend: `closed` → Frontend: `closed` (previously `is_closed`)

## API Integration

### PropertyService
The `create` method now properly maps frontend fields to backend fields:
```typescript
create: async (propertyData: any) => {
  const mappedProperty = {
    title: propertyData.title,
    category: propertyData.category,
    featured: propertyData.featured,
    description: propertyData.description,
    // ... other fields mapped correctly
  };
  
  const response = await apiClient.post(`/admin/properties`, mappedProperty);
  return response.data;
}
```

### RoomService
The `create` method now properly maps frontend fields to backend fields:
```typescript
create: async (propertyId: number, roomData: any) => {
  const mappedRoom = {
    name: roomData.name,
    room_type: roomData.room_type,
    description: roomData.description,
    total_rooms: roomData.total_rooms,
    price: roomData.price,
    max_adults: roomData.max_adults,
    max_children: roomData.max_children,
    max_infants: roomData.max_infants,
    // ... other fields mapped correctly
  };
  
  const response = await apiClient.post(`/admin/properties/${propertyId}/rooms`, mappedRoom);
  return response.data;
}
```

### AvailabilityService
The update methods now use the correct field names:
```typescript
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
  const response = await apiClient.put(`/admin/properties/${propertyId}/rooms/${roomId}/availability/${date}`, data);
  return response.data;
}
```

## Changes Summary

1. Updated all TypeScript model definitions to match backend models
2. Fixed form fields in PropertyCreate, RoomCreate, and Availability components
3. Updated service layer methods to map frontend fields to backend API fields
4. Fixed display issues in components (e.g., property?.title instead of property?.name)
5. Updated form validation to match backend requirements
6. Fixed availability management to use correct field names (available_rooms, price_modifier, closed)
