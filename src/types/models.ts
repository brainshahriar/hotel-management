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
    check_in_time?: string;  // Now part of policies object
    check_out_time?: string; // Now part of policies object
  };
  check_in_options: {
    time_range?: string;
    early_check_in?: boolean;
    early_check_in_fee?: number;
  } | string[]; // Support both object and array formats
  check_out_options: {
    time?: string;
    late_check_out?: boolean;
    late_check_out_fee?: number;
  } | string[]; // Support both object and array formats
  min_stay_nights: number;
  property_surroundings: {
    beach?: string;
    restaurants?: string[];
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

export interface PropertyGalleryImage {
  id: number;
  property_id: number;
  room_id: number;
  image_path: string;
  caption: string;
  order: number;
  created_at: string;
  updated_at: string;
}

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

export interface Booking {
  id: number;
  property_id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_guests: number;
  adults: number;
  children: number;
  base_price: number;
  total_price: number;
  status: string;
  payment_status: string;
  special_requests: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
