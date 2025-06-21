import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  FormHelperText,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, addDays, eachDayOfInterval, parseISO } from 'date-fns';

import { RoomAvailability, Room, Property } from '../../types/models';
import { AvailabilityService } from '../../services/availabilityService';
import { PropertyService } from '../../services/propertyService';
import { RoomService } from '../../services/roomService';

const Availability: React.FC = () => {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 14));
  const [dateRange, setDateRange] = useState<string[]>([]);
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: RoomAvailability }>({});
  
  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    available_rooms: 0,
    price_modifier: 0,
    closed: false,
  });

  // Bulk Edit Modal
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
  const [bulkStartDate, setBulkStartDate] = useState<Date | null>(null);
  const [bulkEndDate, setBulkEndDate] = useState<Date | null>(null);
  const [bulkFormData, setBulkFormData] = useState({
    available_rooms: '',
    price_modifier: '',
    closed: false,
  });

  useEffect(() => {
    if (propertyId && roomId) {
      fetchPropertyAndRoom();
    }
  }, [propertyId, roomId]);

  useEffect(() => {
    if (propertyId && roomId) {
      generateDateRange();
      fetchAvailabilityData();
    }
  }, [startDate, endDate, propertyId, roomId]);

  const fetchPropertyAndRoom = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const propertyResponse = await PropertyService.getById(Number(propertyId));
      if (propertyResponse.success && propertyResponse.data) {
        setProperty(propertyResponse.data);
      }
      
      // Fetch room details
      const roomResponse = await RoomService.getById(Number(propertyId), Number(roomId));
      if (roomResponse.success && roomResponse.data) {
        setRoom(roomResponse.data);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error fetching property and room data');
      console.error('Error fetching property and room data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDateRange = () => {
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    }).map(date => format(date, 'yyyy-MM-dd'));
    
    setDateRange(days);
  };

  const fetchAvailabilityData = async () => {
    if (!propertyId || !roomId) return;
    
    try {
      setLoading(true);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await AvailabilityService.getForDateRange(
        Number(propertyId),
        Number(roomId),
        formattedStartDate,
        formattedEndDate
      );
      
      // Handle nested response structure
      const availabilityArray = response.success && response.data ? 
        (response.data.data || []) : [];
      
      // Convert array to object with date as key for easier lookup
      const availabilityMap: { [key: string]: RoomAvailability } = {};
      availabilityArray.forEach((item: RoomAvailability) => {
        availabilityMap[item.date] = item;
      });
      
      setAvailabilityData(availabilityMap);
      
    } catch (err: any) {
      setError(err.message || 'Error fetching availability data');
      console.error('Error fetching availability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: [Date | null, Date | null]) => {
    if (newDateRange[0]) setStartDate(newDateRange[0]);
    if (newDateRange[1]) setEndDate(newDateRange[1]);
  };
  
  const handleEditClick = (date: string) => {
    const availability = availabilityData[date] || {
      available_rooms: room?.total_rooms || 0,
      price_modifier: 0,
      closed: false,
    };
    
    setSelectedDate(date);
    setFormData({
      available_rooms: availability.available_rooms,
      price_modifier: availability.price_modifier || 0,
      closed: availability.closed || false,
    });
    
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveAvailability = async () => {
    if (!propertyId || !roomId || !selectedDate) return;
    
    try {
      await AvailabilityService.updateForDate(
        Number(propertyId),
        Number(roomId),
        selectedDate,
        formData
      );
      
      // Update the local state
      setAvailabilityData({
        ...availabilityData,
        [selectedDate]: {
          ...(availabilityData[selectedDate] || {}),
          date: selectedDate,
          room_id: Number(roomId),
          ...formData,
        } as RoomAvailability,
      });
      
      setModalOpen(false);
      
    } catch (err: any) {
      setError(err.message || 'Error updating availability');
      console.error('Error updating availability:', err);
    }
  };
  
  const openBulkEditModal = () => {
    setBulkStartDate(startDate);
    setBulkEndDate(endDate);
    setBulkFormData({
      available_rooms: '',
      price_modifier: '',
      closed: false,
    });
    setBulkModalOpen(true);
  };

  const handleBulkModalClose = () => {
    setBulkModalOpen(false);
  };

  const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setBulkFormData({
      ...bulkFormData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleBulkSave = async () => {
    if (!propertyId || !roomId || !bulkStartDate || !bulkEndDate) return;
    
    try {
      const formattedBulkStartDate = format(bulkStartDate, 'yyyy-MM-dd');
      const formattedBulkEndDate = format(bulkEndDate, 'yyyy-MM-dd');
        
      // Convert empty strings to undefined for optional fields
      const dataToSend: any = {};
      
      if (bulkFormData.available_rooms !== '') {
        dataToSend.available_rooms = parseInt(bulkFormData.available_rooms, 10);
      }
      
      if (bulkFormData.price_modifier !== '') {
        dataToSend.price_modifier = parseFloat(bulkFormData.price_modifier);
      }
      
      dataToSend.closed = bulkFormData.closed;
      
      await AvailabilityService.bulkUpdate(
        Number(propertyId),
        Number(roomId),
        formattedBulkStartDate,
        formattedBulkEndDate,
        dataToSend
      );
      
      // Refresh availability data
      fetchAvailabilityData();
      
      setBulkModalOpen(false);
      
    } catch (err: any) {
      setError(err.message || 'Error performing bulk update');
      console.error('Error performing bulk update:', err);
    }
  };

  // Helper to get CSS class based on availability status
  const getCellStyle = (date: string) => {
    const availability = availabilityData[date];
    
    if (!availability) {
      return { bgcolor: '#f5f5f5' };
    }
    
    if (availability.closed) {
      return { bgcolor: '#ffcdd2' }; // Red for closed
    }
    
    if (availability.available_rooms === 0) {
      return { bgcolor: '#fff9c4' }; // Yellow for sold out
    }
    
    // Green for available with varying intensity based on availability percentage
    const availabilityPercentage = (availability.available_rooms / (room?.total_rooms || 1)) * 100;
    
    if (availabilityPercentage > 70) {
      return { bgcolor: '#c8e6c9' }; // Light green for high availability
    } else if (availabilityPercentage > 30) {
      return { bgcolor: '#dcedc8' }; // Medium green for medium availability
    } else {
      return { bgcolor: '#f0f4c3' }; // Dark yellow for low availability
    }
  };

  if (loading && (!property || !room)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <Typography variant="h4" component="h1">
          Availability Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="subtitle1">
            Property: <strong>{property?.title}</strong>
          </Typography>
          <Typography variant="subtitle1">
            Room: <strong>{room?.name}</strong>
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Date Range</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={openBulkEditModal}
          >
            Bulk Edit
          </Button>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newDate) => newDate && setStartDate(newDate)}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newDate) => newDate && setEndDate(newDate)}
              minDate={startDate}
            />
          </Box>
        </LocalizationProvider>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="center">Day</TableCell>
              <TableCell align="center">Available Rooms</TableCell>
              <TableCell align="center">Price Modifier</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dateRange.map((date) => {
              const availability = availabilityData[date];
              const jsDate = parseISO(date);
              
              return (
                <TableRow key={date} sx={getCellStyle(date)}>
                  <TableCell>{format(jsDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell align="center">{format(jsDate, 'EEEE')}</TableCell>
                  <TableCell align="center">
                    {availability ? availability.available_rooms : room?.total_rooms}
                  </TableCell>
                  <TableCell align="center">
                    {availability ? `${availability.price_modifier > 0 ? '+' : ''}${availability.price_modifier}%` : '0%'}
                  </TableCell>
                  <TableCell align="center">
                    {availability?.closed ? 'Closed' : availability?.available_rooms === 0 ? 'Sold Out' : 'Available'}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => handleEditClick(date)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Availability for {selectedDate ? format(parseISO(selectedDate), 'MMMM dd, yyyy') : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              fullWidth
              label="Available Rooms"
              name="available_rooms"
              type="number"
              value={formData.available_rooms}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0, max: room?.total_rooms || 100 } }}
              disabled={formData.closed}
            />
            
            <TextField
              fullWidth
              label="Price Modifier (%)"
              name="price_modifier"
              type="number"
              value={formData.price_modifier}
              onChange={handleInputChange}
              helperText="Percentage adjustment to base price. Can be negative."
              disabled={formData.closed}
            />
            
            <FormControlLabel
              control={
                <Switch
                  name="closed"
                  checked={formData.closed}
                  onChange={handleInputChange}
                />
              }
              label="Room Closed"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button onClick={handleSaveAvailability} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={bulkModalOpen} onClose={handleBulkModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Edit Availability</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={bulkStartDate}
                  onChange={(newDate) => newDate && setBulkStartDate(newDate)}
                />
                
                <DatePicker
                  label="End Date"
                  value={bulkEndDate}
                  onChange={(newDate) => newDate && setBulkEndDate(newDate)}
                  minDate={bulkStartDate || undefined}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Available Rooms"
              name="available_rooms"
              type="number"
              value={bulkFormData.available_rooms}
              onChange={handleBulkInputChange}
              InputProps={{ inputProps: { min: 0, max: room?.total_rooms || 100 } }}
              helperText="Leave empty to keep current values"
              disabled={bulkFormData.closed}
            />
            
            <TextField
              fullWidth
              label="Price Modifier (%)"
              name="price_modifier"
              type="number"
              value={bulkFormData.price_modifier}
              onChange={handleBulkInputChange}
              helperText="Percentage adjustment to base price. Leave empty to keep current values."
              disabled={bulkFormData.closed}
            />
            
            <FormControlLabel
              control={
                <Switch
                  name="closed"
                  checked={bulkFormData.closed}
                  onChange={handleBulkInputChange}
                />
              }
              label="Close Rooms for Selected Date Range"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkModalClose}>Cancel</Button>
          <Button onClick={handleBulkSave} variant="contained" color="primary">
            Apply to All Selected Dates
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Availability;
