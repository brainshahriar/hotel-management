import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Grid,
  Rating as MuiRating
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Property } from '../../types/models';
import { PropertyService } from '../../services/propertyService';

// Form values interface to match backend expectations
interface PropertyFormValues {
  title: string;
  category: string;
  description: string;
  featured: boolean;
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
  image_path: string;
  policies: {
    cancellation?: string;
    payment?: string;
    other?: string;
    check_in_time?: string;  // Now in policies object
    check_out_time?: string; // Now in policies object
  };
  check_in_options: string[]; // Keep as string[] for UI consistency
  check_out_options: string[]; // Keep as string[] for UI consistency
  min_stay_nights: number;
  property_surroundings: {
    beach?: string;
    restaurants?: string[];
    nearby_attractions?: string[];
    transportation?: string[];
    airports?: string[];
  };
  house_rules: string[];
}

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  rating: Yup.number().min(1).max(5).required('Rating is required'),
  location: Yup.string().required('Location is required'),
  price: Yup.number().min(0).required('Price is required'),
  price_type: Yup.string().required('Price type is required'),
  room_count: Yup.number().min(0).required('Room count is required'),
  capacity: Yup.number().min(1).required('Capacity is required'),
});

const PropertyEdit: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [initialValues, setInitialValues] = useState<PropertyFormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await PropertyService.getById(Number(propertyId));
      setProperty(response.data);
      
      // Convert check_in_options from object format to string array if needed
      let checkInOptions: string[] = [];
      if (Array.isArray(response.data.check_in_options)) {
        checkInOptions = response.data.check_in_options;
      } else if (typeof response.data.check_in_options === 'object' && response.data.check_in_options !== null) {
        // Handle object format and extract key information
        if (response.data.check_in_options.time_range) {
          checkInOptions.push(`Time Range: ${response.data.check_in_options.time_range}`);
        }
        if (response.data.check_in_options.early_check_in) {
          checkInOptions.push(`Early Check-in Available (Fee: $${response.data.check_in_options.early_check_in_fee || 0})`);
        }
      }

      // Convert check_out_options from object format to string array if needed
      let checkOutOptions: string[] = [];
      if (Array.isArray(response.data.check_out_options)) {
        checkOutOptions = response.data.check_out_options;
      } else if (typeof response.data.check_out_options === 'object' && response.data.check_out_options !== null) {
        // Handle object format and extract key information
        if (response.data.check_out_options.time) {
          checkOutOptions.push(`Time: ${response.data.check_out_options.time}`);
        }
        if (response.data.check_out_options.late_check_out) {
          checkOutOptions.push(`Late Check-out Available (Fee: $${response.data.check_out_options.late_check_out_fee || 0})`);
        }
      }
      
      // Map the API response to our form structure
      const propertyData: PropertyFormValues = {
        title: response.data.title,
        category: response.data.category,
        description: response.data.description,
        featured: response.data.featured || false,
        rating: response.data.rating || 0,
        location: response.data.location,
        price: response.data.price || 0,
        price_type: response.data.price_type || 'nightly',
        room_count: response.data.room_count || 0,
        capacity: response.data.capacity || 0,
        amenities: response.data.amenities || [],
        highlights: response.data.highlights || [],
        lat: response.data.lat || 0,
        lon: response.data.lon || 0,
        image_path: response.data.image_path || '',
        policies: {
          ...(response.data.policies || {}),
          cancellation: response.data.policies?.cancellation || '',
          payment: response.data.policies?.payment || '',
          other: response.data.policies?.other || '',
          check_in_time: response.data.policies?.check_in_time || '',
          check_out_time: response.data.policies?.check_out_time || '',
        },
        check_in_options: checkInOptions,
        check_out_options: checkOutOptions,
        min_stay_nights: response.data.min_stay_nights || 1,
        property_surroundings: response.data.property_surroundings || {
          beach: '',
          restaurants: [],
          nearby_attractions: [],
          transportation: [],
          airports: []
        },
        house_rules: response.data.house_rules || []
      };
      
      setInitialValues(propertyData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property details');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };  const handleSubmit = async (values: PropertyFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create a data object that matches the Property type
      const propertyData: Partial<Property> = {
        title: values.title,
        category: values.category,
        description: values.description,
        featured: values.featured,
        rating: values.rating,
        location: values.location,
        price: values.price,
        price_type: values.price_type,
        room_count: values.room_count,
        capacity: values.capacity,
        amenities: values.amenities,
        highlights: values.highlights,
        lat: values.lat,
        lon: values.lon,
        image_path: values.image_path,        // Create policies object based on backend structure
        policies: {
          cancellation: values.policies.cancellation,
          payment: values.policies.payment,
          other: values.policies.other,
          check_in_time: values.policies.check_in_time,
          check_out_time: values.policies.check_out_time,
        } as any, // Use 'as any' to allow for dynamic properties
        // Keep check_in_options as a string array for API compatibility
        check_in_options: values.check_in_options,
        // Keep check_out_options as a string array for API compatibility
        check_out_options: values.check_out_options,
        min_stay_nights: values.min_stay_nights,
        property_surroundings: values.property_surroundings,
        house_rules: values.house_rules
      };
      
      // Send update to the API
      await PropertyService.update(Number(propertyId), propertyData);
      
      // Navigate to the property detail page
      navigate(`/properties/${propertyId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update property. Please try again.');
      console.error('Error updating property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!property || !initialValues) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Edit Property: {property.title}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/properties/${propertyId}`)}
        >
          Cancel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label="Property Title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    multiline
                    rows={4}
                    variant="outlined"
                  />

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl fullWidth>
                      <InputLabel id="category-label">Property Category</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.category && Boolean(errors.category)}
                        label="Property Category"
                      >
                        <MenuItem value="Hotel">Hotel</MenuItem>
                        <MenuItem value="Resort">Resort</MenuItem>
                        <MenuItem value="Villa">Villa</MenuItem>
                        <MenuItem value="Apartment">Apartment</MenuItem>
                        <MenuItem value="Guesthouse">Guesthouse</MenuItem>
                        <MenuItem value="Hostel">Hostel</MenuItem>
                        <MenuItem value="Motel">Motel</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.featured}
                          onChange={(e) => setFieldValue('featured', e.target.checked)}
                          name="featured"
                          color="primary"
                        />
                      }
                      label="Featured Property"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography component="legend">Rating</Typography>
                    <MuiRating
                      name="rating"
                      value={values.rating}
                      onChange={(event, newValue) => {
                        setFieldValue('rating', newValue);
                      }}
                    />
                    {touched.rating && errors.rating && (
                      <Typography color="error">{errors.rating}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Location & Pricing
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="location"
                    name="location"
                    label="Location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                    variant="outlined"
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      id="lat"
                      name="lat"
                      label="Latitude"
                      type="number"
                      value={values.lat}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.lat && Boolean(errors.lat)}
                      helperText={touched.lat && errors.lat}
                      variant="outlined"
                    />

                    <TextField
                      fullWidth
                      id="lon"
                      name="lon"
                      label="Longitude"
                      type="number"
                      value={values.lon}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.lon && Boolean(errors.lon)}
                      helperText={touched.lon && errors.lon}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      id="price"
                      name="price"
                      label="Price"
                      type="number"
                      value={values.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.price && Boolean(errors.price)}
                      helperText={touched.price && errors.price}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <span>$</span>,
                      }}
                    />

                    <FormControl fullWidth>
                      <InputLabel id="price-type-label">Price Type</InputLabel>
                      <Select
                        labelId="price-type-label"
                        id="price_type"
                        name="price_type"
                        value={values.price_type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.price_type && Boolean(errors.price_type)}
                        label="Price Type"
                      >
                        <MenuItem value="nightly">Nightly</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Capacity & Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      id="room_count"
                      name="room_count"
                      label="Room Count"
                      type="number"
                      value={values.room_count}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.room_count && Boolean(errors.room_count)}
                      helperText={touched.room_count && errors.room_count}
                      variant="outlined"
                    />

                    <TextField
                      fullWidth
                      id="capacity"
                      name="capacity"
                      label="Total Capacity"
                      type="number"
                      value={values.capacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.capacity && Boolean(errors.capacity)}
                      helperText={touched.capacity && errors.capacity}
                      variant="outlined"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    id="min_stay_nights"
                    name="min_stay_nights"
                    label="Minimum Stay Nights"
                    type="number"
                    value={values.min_stay_nights}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.min_stay_nights && Boolean(errors.min_stay_nights)}
                    helperText={touched.min_stay_nights && errors.min_stay_nights}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Amenities
                </Typography>
                <FieldArray
                  name="amenities"
                  render={arrayHelpers => (
                    <Box>
                      {values.amenities && values.amenities.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {values.amenities.map((amenity, index) => (
                            <Chip
                              key={index}
                              label={amenity}
                              onDelete={() => arrayHelpers.remove(index)}
                              color="primary"
                              variant="outlined"
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : null}
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Add Amenity"
                          id="new-amenity"
                          sx={{ mr: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                arrayHelpers.push(target.value.trim());
                                target.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            const input = document.getElementById('new-amenity') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              arrayHelpers.push(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </Box>
                  )}                />
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Highlights
                </Typography>
                <FieldArray
                  name="highlights"
                  render={arrayHelpers => (
                    <Box>
                      {values.highlights && values.highlights.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {values.highlights.map((highlight, index) => (
                            <Chip
                              key={index}
                              label={highlight}
                              onDelete={() => arrayHelpers.remove(index)}
                              color="secondary"
                              variant="outlined"
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : null}
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Add Highlight"
                          id="new-highlight"
                          sx={{ mr: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                arrayHelpers.push(target.value.trim());
                                target.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            const input = document.getElementById('new-highlight') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              arrayHelpers.push(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Policies
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle1">Cancellation Policy</Typography>
                  <TextField
                    fullWidth
                    id="policies.cancellation"
                    name="policies.cancellation"
                    label="Cancellation Policy"
                    value={values.policies?.cancellation || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                  
                  <Typography variant="subtitle1">Payment Policy</Typography>
                  <TextField
                    fullWidth
                    id="policies.payment"
                    name="policies.payment"
                    label="Payment Policy"
                    value={values.policies?.payment || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                  
                  <Typography variant="subtitle1">Other Policies</Typography>
                  <TextField
                    fullWidth
                    id="policies.other"
                    name="policies.other"
                    label="Other Policies"
                    value={values.policies?.other || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Check-in Time</Typography>
                      <TextField
                        fullWidth
                        id="policies.check_in_time"
                        name="policies.check_in_time"
                        label="Check-in Time (e.g., 14:00-22:00)"
                        value={values.policies?.check_in_time || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Check-out Time</Typography>
                      <TextField
                        fullWidth
                        id="policies.check_out_time"
                        name="policies.check_out_time"
                        label="Check-out Time (e.g., 11:00)"
                        value={values.policies?.check_out_time || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  House Rules
                </Typography>
                <FieldArray
                  name="house_rules"
                  render={arrayHelpers => (
                    <Box>
                      {values.house_rules && values.house_rules.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {values.house_rules.map((rule, index) => (
                            <Chip
                              key={index}
                              label={rule}
                              onDelete={() => arrayHelpers.remove(index)}
                              color="default"
                              variant="outlined"
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : null}
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Add House Rule"
                          id="new-house-rule"
                          sx={{ mr: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                arrayHelpers.push(target.value.trim());
                                target.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            const input = document.getElementById('new-house-rule') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              arrayHelpers.push(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
              
              <Divider sx={{ my: 4 }} />
                <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Check-In/Check-Out Options
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Check-In Options</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Note: Check-in time is set in the Policies section. 
                      Add additional check-in options or instructions here.
                    </Typography>
                  </Box>
                  <FieldArray
                    name="check_in_options"
                    render={arrayHelpers => (
                      <Box>
                        {Array.isArray(values.check_in_options) && values.check_in_options.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {values.check_in_options.map((option: string, index: number) => (
                              <Chip
                                key={index}
                                label={option}
                                onDelete={() => arrayHelpers.remove(index)}
                                color="info"
                                variant="outlined"
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : null}
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Add Check-In Option"
                            id="new-check-in-option"
                            sx={{ mr: 1 }}
                            placeholder="e.g., Self check-in with lockbox"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  arrayHelpers.push(target.value.trim());
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={(e) => {
                              const input = document.getElementById('new-check-in-option') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                arrayHelpers.push(input.value.trim());
                                input.value = '';
                              }
                            }}
                          >
                            <AddIcon />
                          </Button>
                        </Box>

                        <FormControlLabel
                          control={
                            <Switch 
                              checked={Array.isArray(values.check_in_options) && 
                                values.check_in_options.some(opt => opt.includes('Early Check-in Available'))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add early check-in option if not already present
                                  if (Array.isArray(values.check_in_options) && 
                                      !values.check_in_options.some(opt => opt.includes('Early Check-in Available'))) {
                                    arrayHelpers.push('Early Check-in Available (Fee: $50)');
                                  }
                                } else {
                                  // Remove early check-in option if present
                                  if (Array.isArray(values.check_in_options)) {
                                    const index = values.check_in_options.findIndex(opt => opt.includes('Early Check-in Available'));
                                    if (index !== -1) {
                                      arrayHelpers.remove(index);
                                    }
                                  }
                                }
                              }}
                            />
                          }
                          label="Allow Early Check-in (Additional Fee)"
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    )}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle1">Check-Out Options</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Note: Check-out time is set in the Policies section. 
                      Add additional check-out options or instructions here.
                    </Typography>
                  </Box>
                  <FieldArray
                    name="check_out_options"
                    render={arrayHelpers => (
                      <Box>
                        {Array.isArray(values.check_out_options) && values.check_out_options.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {values.check_out_options.map((option: string, index: number) => (
                              <Chip
                                key={index}
                                label={option}
                                onDelete={() => arrayHelpers.remove(index)}
                                color="info"
                                variant="outlined"
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : null}
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Add Check-Out Option"
                            id="new-check-out-option"
                            sx={{ mr: 1 }}
                            placeholder="e.g., Leave key on kitchen counter"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  arrayHelpers.push(target.value.trim());
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={(e) => {
                              const input = document.getElementById('new-check-out-option') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                arrayHelpers.push(input.value.trim());
                                input.value = '';
                              }
                            }}
                          >
                            <AddIcon />
                          </Button>
                        </Box>

                        <FormControlLabel
                          control={
                            <Switch 
                              checked={Array.isArray(values.check_out_options) && 
                                values.check_out_options.some(opt => opt.includes('Late Check-out Available'))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add late check-out option if not already present
                                  if (Array.isArray(values.check_out_options) && 
                                      !values.check_out_options.some(opt => opt.includes('Late Check-out Available'))) {
                                    arrayHelpers.push('Late Check-out Available (Fee: $40)');
                                  }
                                } else {
                                  // Remove late check-out option if present
                                  if (Array.isArray(values.check_out_options)) {
                                    const index = values.check_out_options.findIndex(opt => opt.includes('Late Check-out Available'));
                                    if (index !== -1) {
                                      arrayHelpers.remove(index);
                                    }
                                  }
                                }
                              }}
                            />
                          }
                          label="Allow Late Check-out (Additional Fee)"
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Property'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default PropertyEdit;
