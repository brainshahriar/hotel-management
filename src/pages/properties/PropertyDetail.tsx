import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Room as RoomIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Schedule as ScheduleIcon,
  Hotel as HotelIcon,
  Spa as AmenityIcon,
  Gavel as RuleIcon,
} from '@mui/icons-material';
import { PropertyService } from '../../services/propertyService';
import { RoomService } from '../../services/roomService';
import { Property, Room } from '../../types/models';

const PropertyDetail: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAndRooms();
    }
  }, [propertyId]);

  const fetchPropertyAndRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const propertyResponse = await PropertyService.getById(Number(propertyId));
      if (propertyResponse.success && propertyResponse.data) {
        setProperty(propertyResponse.data);
      }
      
      // Fetch rooms
      const roomsResponse = await RoomService.getAllForProperty(Number(propertyId));
      if (roomsResponse.success && roomsResponse.data) {
        // Access the nested data array containing the rooms
        setRooms(roomsResponse.data.data || []);
      } else {
        setRooms([]);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error fetching property details');
      console.error('Error fetching property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = () => {
    navigate(`/properties/${propertyId}/edit`);
  };

  const handleDeleteProperty = async () => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await PropertyService.delete(Number(propertyId));
        navigate('/properties');
      } catch (err: any) {
        setError(err.message || 'Error deleting property');
        console.error('Error deleting property:', err);
      }
    }
  };

  const handleAddRoom = () => {
    navigate(`/properties/${propertyId}/rooms/new`);
  };

  const handleViewRooms = () => {
    navigate(`/properties/${propertyId}/rooms`);
  };

  const handleViewRoom = (roomId: number) => {
    navigate(`/properties/${propertyId}/rooms/${roomId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box>
        <Typography color="error">
          {error || 'Property not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/properties')}>
          Return to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>          <Typography variant="h4" component="h1" gutterBottom>
          {property.title}
        </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="subtitle1">
              {property.location}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RoomIcon />}
            onClick={handleViewRooms}
            sx={{ mr: 1 }}
          >
            View Rooms
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<EditIcon />}
            onClick={handleEditProperty}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteProperty}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left column */}
        <Box sx={{ flex: '1 1 66%' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StarIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="body1">
                {property.rating} Star Rating
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HotelIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="body1">
                Property Type: <Chip label={property.category} size="small" color="primary" />
              </Typography>
            </Box>              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="body1">
                {property.policies?.check_in_time && property.policies?.check_out_time ? (
                  <>Check-in: {property.policies.check_in_time} | Check-out: {property.policies.check_out_time}</>
                ) : (
                  <>Minimum stay: {property.min_stay_nights} nights</>
                )}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Price Information
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                ${property.price} / {property.price_type}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                Capacity: {property.capacity} guests
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                Room Count: {property.room_count} rooms
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Amenities
            </Typography>            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(property.amenities || []).map((amenity: string, index: number) => (
                <Chip
                  key={index}
                  icon={<AmenityIcon />}
                  label={amenity}
                  variant="outlined"
                  size="medium"
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Highlights
            </Typography>            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(property.highlights || []).map((highlight: string, index: number) => (
                <Chip
                  key={index}
                  label={highlight}
                  color="secondary"
                  size="medium"
                />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Right column */}
        <Box sx={{ flex: '1 1 33%' }}>          <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Check-in & Check-out Options
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Check-in Options"
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {/* Handle object format */}
                    {!Array.isArray(property.check_in_options) && typeof property.check_in_options === 'object' && property.check_in_options !== null ? (
                      <Box>
                        <Typography variant="body2">
                          Time Range: {property.check_in_options.time_range || property.policies?.check_in_time}
                        </Typography>
                        {property.check_in_options.early_check_in && (
                          <Typography variant="body2">
                            Early Check-in Available (Fee: ${property.check_in_options.early_check_in_fee || 0})
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      /* Handle array format */
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Array.isArray(property.check_in_options) && property.check_in_options.map((option: string, index: number) => (
                          <Chip key={index} label={option} size="small" />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Check-out Options"
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {/* Handle object format */}
                    {!Array.isArray(property.check_out_options) && typeof property.check_out_options === 'object' && property.check_out_options !== null ? (
                      <Box>
                        <Typography variant="body2">
                          Time: {property.check_out_options.time || property.policies?.check_out_time}
                        </Typography>
                        {property.check_out_options.late_check_out && (
                          <Typography variant="body2">
                            Late Check-out Available (Fee: ${property.check_out_options.late_check_out_fee || 0})
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      /* Handle array format */
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Array.isArray(property.check_out_options) && property.check_out_options.map((option: string, index: number) => (
                          <Chip key={index} label={option} size="small" />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Policies
            </Typography>
            {property.policies.cancellation && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Cancellation Policy
                </Typography>
                <Typography variant="body2">
                  {property.policies.cancellation}
                </Typography>
              </Box>
            )}
            {property.policies.payment && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Payment Policy
                </Typography>
                <Typography variant="body2">
                  {property.policies.payment}
                </Typography>
              </Box>
            )}
            {property.policies.other && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Other Policies
                </Typography>
                <Typography variant="body2">
                  {property.policies.other}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              House Rules
            </Typography>            <List dense>
              {(property.house_rules || []).map((rule: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <RuleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={rule} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Rooms section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Rooms ({rooms.length})
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRoom}
          >
            Add Room
          </Button>
        </Box>

        {rooms.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            No rooms found for this property. Click 'Add Room' to create one.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {rooms.map((room: Room) => (<Box key={room.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {room.image_path && (
                  <Box
                    sx={{
                      height: 180,
                      backgroundImage: `url(${room.image_url || `/storage/${room.image_path}`})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {room.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type: {room.room_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size: {room.size_sqm} sqm
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${room.price?.toFixed(2)} / night
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Max Adults: {room.max_adults} | Max Children: {room.max_children} | Max Infants: {room.max_infants}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewRoom(room.id)}>
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/properties/${propertyId}/rooms/${room.id}/availability`)}
                  >
                    Availability
                  </Button>
                </CardActions>
              </Card>
            </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PropertyDetail;
