# Hotel Property Management System

## Project Overview

This project is a hotel property/room inventory and availability management system, similar to booking.com. The system consists of:

1. A Laravel backend API for managing properties, rooms, room availability, and bookings
2. A React frontend dashboard for hotel administrators

## Backend (Laravel)

The backend is built with Laravel and provides RESTful APIs for:

- Property management (CRUD)
- Room type management (CRUD)
- Day-by-day room availability management
- Price modifiers for specific dates
- Room closure functionality
- Booking management

## Frontend (React)

The frontend is a React application with TypeScript that provides:

- Property and room management dashboard
- Calendar-based availability management
- Visual representation of room status (available, sold out, closed)
- Bulk editing capabilities for availability and pricing
- Booking overview

## Key Considerations

When contributing to this project, keep in mind:

1. The system needs to handle complex availability logic including:
   - Day-by-day tracking of available rooms
   - Price modifications for specific dates or date ranges
   - Room closures with reason tracking
   - Booking impact on availability

2. The dashboard UI should be intuitive for hotel managers to:
   - View and filter properties and rooms
   - Visualize availability across date ranges
   - Apply bulk changes to multiple dates
   - Monitor booking status

3. Performance considerations:
   - Efficient data loading for calendar views
   - Optimistic UI updates
   - Batch operations for bulk changes

## API Endpoints

The key API endpoints to integrate with are:

- GET /api/admin/properties - List all properties
- GET/POST/PUT/DELETE /api/admin/properties/{id} - Property CRUD operations
- GET/POST/PUT/DELETE /api/admin/properties/{id}/rooms/{id} - Room CRUD operations
- GET/PUT /api/admin/properties/{id}/rooms/{id}/availability - Get/update room availability
- PUT /api/admin/properties/{id}/rooms/{id}/bulk-availability - Bulk update availability
- GET /api/admin/bookings - List all bookings
- GET/POST/PUT /api/admin/bookings/{id} - Booking operations
