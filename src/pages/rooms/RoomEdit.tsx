import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RoomService } from '../../services/roomService';
import { PropertyService } from '../../services/propertyService';
import { Property, Room } from '../../types/models';

interface BedConfig {
  type: string;
  count: number;
}

const RoomEdit: React.FC = () => {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState<string>('');
  const [bedConfigurations, setBedConfigurations] = useState<BedConfig[]>([
    { type: 'Queen', count: 1 },
  ]);

  useEffect(() => {
    if (propertyId && roomId) {
      fetchPropertyAndRoom();
    }
  }, [propertyId, roomId]);

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
      const roomData = roomResponse.success && roomResponse.data ? roomResponse.data : {};
      setRoom(roomData);
      
      // Set form values - map API response fields to form fields
      formik.setValues({
        name: roomData.name || '',
        description: roomData.description || '',
        // Map price to base_price if it exists
        base_price: roomData.price || roomData.base_price || 0,
        // Calculate capacity from max values if not provided
        capacity: roomData.capacity || (roomData.max_adults || 0) + (roomData.max_children || 0),
        max_adults: roomData.max_adults || 1,
        max_children: roomData.max_children || 0,
        // Map size_sqm to size if it exists
        size: roomData.size_sqm || roomData.size || 0,
        size_unit: roomData.size_unit || 'sq ft',
        thumbnail: roomData.image_url || roomData.image_path || '',
      });
      
      // Set amenities
      setAmenities(roomData.amenities || []);
      
      // Set bed configurations
      if (roomData.bed_configuration) {
        setBedConfigurations(roomData.bed_configuration);
      } else if (roomData.bed_type) {
        // Create bed configuration from bed_type if it exists
        setBedConfigurations([{ type: roomData.bed_type, count: 1 }]);
      } else {
        setBedConfigurations([{ type: 'Queen', count: 1 }]);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error fetching room details');
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Room name is required'),
    description: Yup.string().required('Description is required'),
    base_price: Yup.number()
      .required('Base price is required')
      .positive('Base price must be positive'),
    capacity: Yup.number()
      .required('Capacity is required')
      .positive('Capacity must be positive')
      .integer('Capacity must be an integer'),
    max_adults: Yup.number()
      .required('Maximum adults is required')
      .positive('Maximum adults must be positive')
      .integer('Maximum adults must be an integer'),
    max_children: Yup.number()
      .required('Maximum children is required')
      .min(0, 'Maximum children cannot be negative')
      .integer('Maximum children must be an integer'),
    size: Yup.number()
      .required('Room size is required')
      .positive('Room size must be positive'),
    size_unit: Yup.string().required('Size unit is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      base_price: 0,
      capacity: 1,
      max_adults: 1,
      max_children: 0,
      size: 0,
      size_unit: 'sq ft',
      thumbnail: '',
    },
    validationSchema,    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Map form values to match API expected fields
        const roomData = {
          ...values,
          // Map base_price back to price for the API
          price: values.base_price,
          // Map size to size_sqm for the API
          size_sqm: values.size,
          amenities,
          bed_configuration: bedConfigurations,
          // Additional mappings that might be needed
          bed_type: bedConfigurations.length > 0 ? bedConfigurations[0].type : 'Queen',
          // Map thumbnail to image_path
          image_path: values.thumbnail
        };
        
        await RoomService.update(Number(propertyId), Number(roomId), roomData);
        
        setSuccess('Room updated successfully');
        setTimeout(() => {
          navigate(`/properties/${propertyId}/rooms/${roomId}`);
        }, 1500);
      } catch (err: any) {
        setError(err.message || 'Error updating room');
        console.error('Error updating room:', err);
      } finally {
        setSubmitting(false);
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

  const handleAddBedConfig = () => {
    setBedConfigurations([...bedConfigurations, { type: '', count: 1 }]);
  };

  const handleBedConfigChange = (index: number, field: keyof BedConfig, value: string | number) => {
    const updatedConfigs = [...bedConfigurations];
    updatedConfigs[index] = { 
      ...updatedConfigs[index], 
      [field]: field === 'count' ? Number(value) : value 
    };
    setBedConfigurations(updatedConfigs);
  };

  const handleDeleteBedConfig = (index: number) => {
    setBedConfigurations(bedConfigurations.filter((_, i) => i !== index));
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
          Room or property not found. Please check the URL and try again.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/properties/${propertyId}/rooms`)}
          sx={{ mt: 2 }}
        >
          Back to Rooms
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Edit Room: {room.name}</Typography>
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
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flexBasis: { xs: '100%', md: '30%' } }}>
                <TextField
                  fullWidth
                  label="Base Price"
                  name="base_price"
                  type="number"
                  value={formik.values.base_price}
                  onChange={formik.handleChange}
                  error={formik.touched.base_price && Boolean(formik.errors.base_price)}
                  helperText={formik.touched.base_price && formik.errors.base_price}
                  InputProps={{
                    startAdornment: <Typography variant="body1">$</Typography>,
                  }}
                />
              </Box>

              <Box sx={{ flexBasis: { xs: '100%', md: '30%' } }}>
                <TextField
                  fullWidth
                  label="Capacity (Total Guests)"
                  name="capacity"
                  type="number"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                  helperText={formik.touched.capacity && formik.errors.capacity}
                />
              </Box>

              <Box sx={{ flexBasis: { xs: '47%', md: '18%' } }}>
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
              </Box>

              <Box sx={{ flexBasis: { xs: '47%', md: '18%' } }}>
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
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flexBasis: { xs: '100%', md: '49%' } }}>
                <TextField
                  fullWidth
                  label="Room Size"
                  name="size"
                  type="number"
                  value={formik.values.size}
                  onChange={formik.handleChange}
                  error={formik.touched.size && Boolean(formik.errors.size)}
                  helperText={formik.touched.size && formik.errors.size}
                />
              </Box>

              <Box sx={{ flexBasis: { xs: '100%', md: '49%' } }}>
                <TextField
                  fullWidth
                  label="Size Unit"
                  name="size_unit"
                  value={formik.values.size_unit}
                  onChange={formik.handleChange}
                  error={formik.touched.size_unit && Boolean(formik.errors.size_unit)}
                  helperText={formik.touched.size_unit && formik.errors.size_unit}
                  placeholder="sq ft, m², etc."
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Thumbnail Image URL"
              name="thumbnail"
              value={formik.values.thumbnail}
              onChange={formik.handleChange}
            />

            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bed Configuration
              </Typography>

              {bedConfigurations.map((bed, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2, 
                    gap: 2 
                  }}
                >
                  <TextField
                    label="Bed Type"
                    value={bed.type}
                    onChange={(e) => handleBedConfigChange(index, 'type', e.target.value)}
                    sx={{ flex: 2 }}
                    placeholder="King, Queen, Twin, etc."
                  />
                  <TextField
                    label="Count"
                    type="number"
                    value={bed.count}
                    onChange={(e) => handleBedConfigChange(index, 'count', e.target.value)}
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteBedConfig(index)}
                    disabled={bedConfigurations.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddBedConfig}
                sx={{ mt: 1 }}
              >
                Add Bed Configuration
              </Button>
            </Box>

            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Room Amenities
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Add Amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddAmenity}
                  disabled={newAmenity.trim() === ''}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => handleDeleteAmenity(amenity)}
                  />
                ))}
                {amenities.length === 0 && (
                  <Typography color="text.secondary">
                    No amenities added yet. Add amenities like "Free WiFi", "Air Conditioning", etc.
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/properties/${propertyId}/rooms/${roomId}`)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit" 
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Update Room'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RoomEdit;
