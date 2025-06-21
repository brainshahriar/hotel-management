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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  AspectRatio as SizeIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Spa as AmenityIcon,
} from '@mui/icons-material';
import { RoomService } from '../../services/roomService';
import { PropertyService } from '../../services/propertyService';
import { Room, Property } from '../../types/models';

const RoomDetail: React.FC = () => {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId && roomId) {
      fetchRoomAndProperty();
    }
  }, [propertyId, roomId]);

  const fetchRoomAndProperty = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const propertyResponse = await PropertyService.getById(Number(propertyId));
      setProperty(propertyResponse.data);
      
      // Fetch room details
      const roomResponse = await RoomService.getById(Number(propertyId), Number(roomId));
      setRoom(roomResponse.data);
      
    } catch (err: any) {
      setError(err.message || 'Error fetching room details');
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = () => {
    navigate(`/properties/${propertyId}/rooms/${roomId}/edit`);
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await RoomService.delete(Number(propertyId), Number(roomId));
        navigate(`/properties/${propertyId}/rooms`);
      } catch (err: any) {
        setError(err.message || 'Error deleting room');
        console.error('Error deleting room:', err);
      }
    }
  };

  const handleManageAvailability = () => {
    navigate(`/properties/${propertyId}/rooms/${roomId}/availability`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!room || !property) {
    return (
      <Box>
        <Typography color="error">
          {error || 'Room not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/properties/${propertyId}/rooms`)}>
          Return to Rooms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {room.name}
          </Typography>          <Typography variant="subtitle1" gutterBottom>
            {property.title}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CalendarIcon />}
            onClick={handleManageAvailability}
            sx={{ mr: 1 }}
          >
            Manage Availability
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<EditIcon />}
            onClick={handleEditRoom}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteRoom}
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
        <Box sx={{ flex: '1 1 66%' }}>
          {/* Room Images */}
          <Paper sx={{ p: 3, mb: 3 }}>            {room.image_url && (
              <Box
                sx={{
                  height: 300,
                  backgroundImage: `url(${room.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
            )}            {/* Gallery images would be added here if available in the API */}
          </Paper>

          {/* Room Description */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {room.description}
            </Typography>
          </Paper>

          {/* Room Amenities */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {room.amenities.map((amenity, index) => (
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
        </Box>

        <Box sx={{ flex: '1 1 33%' }}>
          {/* Room Details */}          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Room Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PriceIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Price" 
                  secondary={`$${room.price.toFixed(2)} per night`} 
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Capacity" 
                  secondary={`${room.max_adults + room.max_children} persons (Max Adults: ${room.max_adults}, Max Children: ${room.max_children}, Max Infants: ${room.max_infants})`} 
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <SizeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Room Size" 
                  secondary={`${room.size_sqm} sqm`} 
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <BedIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Bed Configuration" 
                  secondary={room.bed_type}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Quick Links */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalendarIcon />}
                onClick={handleManageAvailability}
                fullWidth
              >
                Manage Availability & Pricing
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<EditIcon />}
                onClick={handleEditRoom}
                fullWidth
              >
                Edit Room Details
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/properties/${propertyId}/rooms`)}
                fullWidth
              >
                Back to All Rooms
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/properties/${propertyId}`)}
                fullWidth
              >
                Back to Property
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default RoomDetail;
