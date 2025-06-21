import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RoomService } from '../../services/roomService';
import { PropertyService } from '../../services/propertyService';
import { Property, Room } from '../../types/models';

const RoomCreate: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState<string>('');

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await PropertyService.getById(Number(propertyId));
      setProperty(response.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching property details');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Room name is required'),
    room_type: Yup.string().required('Room type is required'),
    description: Yup.string().required('Description is required'),
    total_rooms: Yup.number()
      .required('Total rooms is required')
      .positive('Total rooms must be positive')
      .integer('Total rooms must be an integer'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive'),
    max_adults: Yup.number()
      .required('Maximum adults is required')
      .positive('Maximum adults must be positive')
      .integer('Maximum adults must be an integer'),
    max_children: Yup.number()
      .required('Maximum children is required')
      .min(0, 'Maximum children cannot be negative')
      .integer('Maximum children must be an integer'),
    max_infants: Yup.number()
      .required('Maximum infants is required')
      .min(0, 'Maximum infants cannot be negative')
      .integer('Maximum infants must be an integer'),
    size_sqm: Yup.number()
      .required('Room size is required')
      .positive('Room size must be positive'),
    bed_type: Yup.string().required('Bed type is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      room_type: '',
      description: '',
      total_rooms: 1,
      price: 0,
      max_adults: 1,
      max_children: 0,
      max_infants: 0,
      breakfast_included: false,
      free_cancellation: false,
      size_sqm: 0,
      bed_type: '',
      image_path: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const roomData = {
          ...values,
          amenities,
        };
        
        const response = await RoomService.create(Number(propertyId), roomData);
        
        setSuccess('Room created successfully');
        setTimeout(() => {
          navigate(`/properties/${propertyId}/rooms/${response.data.id}`);
        }, 1500);
      } catch (err: any) {
        setError(err.message || 'Error creating room');
        console.error('Error creating room:', err);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== '' && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity('');
    }
  };

  const handleDeleteAmenity = (amenityToDelete: string) => {
    setAmenities(amenities.filter(amenity => amenity !== amenityToDelete));
  };

  if (loading && !property) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Add New Room to {property?.title}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Room Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            
            <TextField
              fullWidth
              label="Room Type"
              name="room_type"
              value={formik.values.room_type}
              onChange={formik.handleChange}
              error={formik.touched.room_type && Boolean(formik.errors.room_type)}
              helperText={formik.touched.room_type && formik.errors.room_type}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Total Rooms"
                name="total_rooms"
                type="number"
                value={formik.values.total_rooms}
                onChange={formik.handleChange}
                error={formik.touched.total_rooms && Boolean(formik.errors.total_rooms)}
                helperText={formik.touched.total_rooms && formik.errors.total_rooms}
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Box>
            
            <Divider />
              <Typography variant="h6">Capacity</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Max Adults"
                name="max_adults"
                type="number"
                value={formik.values.max_adults}
                onChange={formik.handleChange}
                error={formik.touched.max_adults && Boolean(formik.errors.max_adults)}
                helperText={formik.touched.max_adults && formik.errors.max_adults}
              />
              <TextField
                fullWidth
                label="Max Children"
                name="max_children"
                type="number"
                value={formik.values.max_children}
                onChange={formik.handleChange}
                error={formik.touched.max_children && Boolean(formik.errors.max_children)}
                helperText={formik.touched.max_children && formik.errors.max_children}
              />
              <TextField
                fullWidth
                label="Max Infants"
                name="max_infants"
                type="number"
                value={formik.values.max_infants}
                onChange={formik.handleChange}
                error={formik.touched.max_infants && Boolean(formik.errors.max_infants)}
                helperText={formik.touched.max_infants && formik.errors.max_infants}
              />
            </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="breakfast_included"
                    checked={formik.values.breakfast_included}
                    onChange={formik.handleChange}
                  />
                }
                label="Breakfast Included"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="free_cancellation"
                    checked={formik.values.free_cancellation}
                    onChange={formik.handleChange}
                  />
                }
                label="Free Cancellation"
              />
            </Box>
            
            <Divider />
            
            <Typography variant="h6">Room Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Size (sqm)"
                name="size_sqm"
                type="number"
                value={formik.values.size_sqm}
                onChange={formik.handleChange}
                error={formik.touched.size_sqm && Boolean(formik.errors.size_sqm)}
                helperText={formik.touched.size_sqm && formik.errors.size_sqm}
              />
              <TextField
                fullWidth
                label="Bed Type"
                name="bed_type"
                value={formik.values.bed_type}
                onChange={formik.handleChange}
                error={formik.touched.bed_type && Boolean(formik.errors.bed_type)}
                helperText={formik.touched.bed_type && formik.errors.bed_type}
              />
            </Box>
            
            <Divider />
            
            <Typography variant="h6">Amenities</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {amenities.map((amenity, index) => (
                <Chip 
                  key={index}
                  label={amenity}
                  onDelete={() => handleDeleteAmenity(amenity)}
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Add Amenity"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddAmenity}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Image Path"
              name="image_path"
              value={formik.values.image_path}
              onChange={formik.handleChange}
              placeholder="Enter image path or upload later"
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/properties/${propertyId}`)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Room'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RoomCreate;
