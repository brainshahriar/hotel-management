import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { RoomService } from '../../services/roomService';
import { PropertyService } from '../../services/propertyService';
import { Room, Property } from '../../types/models';

const RoomList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'list' | 'grid'>('grid');

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
      
      // Fetch rooms for the property
      const roomsResponse = await RoomService.getAllForProperty(Number(propertyId));
      if (roomsResponse.success && roomsResponse.data) {
        // Access the nested data array containing the rooms
        setRooms(roomsResponse.data.data || []);
      } else {
        setRooms([]);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error fetching rooms');
      console.error('Error fetching property and rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = () => {
    navigate(`/properties/${propertyId}/rooms/new`);
  };

  const handleEditRoom = (roomId: number) => {
    navigate(`/properties/${propertyId}/rooms/${roomId}/edit`);
  };

  const handleViewRoom = (roomId: number) => {
    navigate(`/properties/${propertyId}/rooms/${roomId}`);
  };

  const handleManageAvailability = (roomId: number) => {
    navigate(`/properties/${propertyId}/rooms/${roomId}/availability`);
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await RoomService.delete(Number(propertyId), roomId);
        
        // Refresh the rooms list
        fetchPropertyAndRooms();
      } catch (err: any) {
        setError(err.message || 'Error deleting room');
        console.error('Error deleting room:', err);
      }
    }
  };

  const toggleViewType = () => {
    setViewType(viewType === 'list' ? 'grid' : 'list');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Rooms
          </Typography>
          {property && (            <Typography variant="subtitle1">
              {property.title}
            </Typography>
          )}
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/properties/${propertyId}`)}
            sx={{ mr: 1 }}
          >
            Back to Property
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRoom}
          >
            Add Room
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {rooms.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            No rooms found for this property.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRoom}
          >
            Add Your First Room
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={toggleViewType}
            >
              {viewType === 'list' ? 'Grid View' : 'List View'}
            </Button>
          </Box>

          {viewType === 'list' ? (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                <Table stickyHeader aria-label="rooms table">
                  <TableHead>
                    <TableRow>                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell>Bed Type</TableCell>
                      <TableCell align="right">Size (sqm)</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow
                        key={room.id}
                        hover
                        onClick={() => handleViewRoom(room.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell component="th" scope="row">
                          {room.name}
                        </TableCell>                        <TableCell>
                          {room.room_type}
                        </TableCell>
                        <TableCell align="right">
                          ${room.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {room.bed_type}
                        </TableCell>
                        <TableCell align="right">
                          {room.size_sqm} sqm
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Manage Availability">
                            <IconButton 
                              color="primary" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManageAvailability(room.id);
                              }}
                            >
                              <CalendarIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Room">
                            <IconButton 
                              color="info" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRoom(room.id);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Room">
                            <IconButton 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRoom(room.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {rooms.map((room) => (
                <Card 
                  key={room.id} 
                  sx={{ 
                    width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >                  {room.image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={room.image_url}
                      alt={room.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {room.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph noWrap>
                      {room.description}
                    </Typography>                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Type: {room.room_type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {room.size_sqm} sqm
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${room.price.toFixed(2)} / night
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                      onClick={() => handleManageAvailability(room.id)}
                    >
                      Availability
                    </Button>
                    <Button 
                      size="small" 
                      color="info"
                      onClick={() => handleEditRoom(room.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default RoomList;
