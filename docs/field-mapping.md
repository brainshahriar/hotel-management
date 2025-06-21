# Field Mapping Documentation

This file explains the mapping between the frontend form fields and the backend API fields. All forms have now been updated to use field names that match the backend API models.

## Property Model

| Frontend Field | Backend Field | Notes |
|---------------|--------------|-------|
| title | title | Direct mapping |
| description | description | Direct mapping |
| category | category | Direct mapping |
| rating | rating | Direct mapping |
| location | location | Direct mapping |
| price | price | Direct mapping |
| price_type | price_type | Direct mapping |
| room_count | room_count | Direct mapping |
| capacity | capacity | Direct mapping |
| amenities | amenities | Direct mapping - array type |
| highlights | highlights | Direct mapping - array type |
| lat | lat | Direct mapping |
| lon | lon | Direct mapping |
| date | date | Direct mapping |
| image_path | image_path | Direct mapping |
| featured | featured | Direct mapping - boolean |
| policies | policies | Direct mapping - object |
| check_in_options | check_in_options | Direct mapping - array type |
| check_out_options | check_out_options | Direct mapping - array type |
| min_stay_nights | min_stay_nights | Direct mapping |
| property_surroundings | property_surroundings | Direct mapping - object |
| house_rules | house_rules | Direct mapping - array type |

## Room Model

| Frontend Field | Backend Field | Notes |
|---------------|--------------|-------|
| name | name | Direct mapping |
| room_type | room_type | Direct mapping |
| description | description | Direct mapping |
| total_rooms | total_rooms | Direct mapping |
| price | price | Direct mapping |
| max_adults | max_adults | Direct mapping |
| max_children | max_children | Direct mapping |
| max_infants | max_infants | Direct mapping |
| breakfast_included | breakfast_included | Direct mapping - boolean |
| free_cancellation | free_cancellation | Direct mapping - boolean |
| amenities | amenities | Direct mapping - array type |
| size_sqm | size_sqm | Direct mapping |
| bed_type | bed_type | Direct mapping |
| image_path | image_path | Direct mapping |

## Room Availability Model

| Frontend Field | Backend Field | Notes |
|---------------|--------------|-------|
| available_rooms | available_rooms | Direct mapping |
| price_modifier | price_modifier | Direct mapping |
| closed | closed | Direct mapping - boolean |

All form components have been updated to match the backend model field names directly, which simplifies the API integration. The service layer still contains mapping logic to handle any edge cases or translations needed for backward compatibility.
