import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Property } from '../../types/models';
import { PropertyService } from '../../services/propertyService';

// Initial property values - matching the backend model's fillable fields
const initialValues = {
  title: '',
  category: 'Hotel',
  featured: false,
  description: '',
  rating: 3,
  location: '',
  price: 0,
  price_type: 'nightly',
  room_count: 1,
  capacity: 2,
  amenities: [] as string[],
  highlights: [] as string[],
  lat: 0,
  lon: 0,
  date: new Date().toISOString().split('T')[0],
  image_path: '',
  policies: {
    cancellation: '',
    payment: '',
    other: '',
    check_in_time: '14:00-22:00', // Match backend format (time range)
    check_out_time: '11:00',      // Match backend format (single time)
  },
  check_in_options: {
    time_range: '14:00-22:00',
    early_check_in: false,
    early_check_in_fee: 50
  },
  check_out_options: {
    time: '11:00',
    late_check_out: false,
    late_check_out_fee: 40
  },
  min_stay_nights: 1,
  property_surroundings: {
    nearby_attractions: [] as string[],
    transportation: [] as string[],
    airports: [] as string[],
  },
  house_rules: [] as string[],
};

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  location: Yup.string().required('Location is required'),
  price: Yup.number().min(0).required('Price is required'),
  price_type: Yup.string().required('Price type is required'),
  room_count: Yup.number().min(1).required('Room count is required'),
  capacity: Yup.number().min(1).required('Capacity is required'),
  rating: Yup.number().min(0).max(5).required('Rating is required'),
  min_stay_nights: Yup.number().min(1).required('Minimum stay nights is required'),
  policies: Yup.object().shape({
    check_in_time: Yup.string().required('Check-in time is required'),
    check_out_time: Yup.string().required('Check-out time is required')
  })
});

const PropertyCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (values: typeof initialValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format data for the API according to backend expectations
      const propertyData = {
        ...values,
        policies: {
          ...values.policies,
          check_in_time: values.policies.check_in_time || '14:00-22:00',
          check_out_time: values.policies.check_out_time || '11:00',
        },
        // Ensure check_in_options and check_out_options are in the expected format
        check_in_options: {
          time_range: values.policies.check_in_time || '14:00-22:00',
          early_check_in: values.check_in_options.early_check_in || false,
          early_check_in_fee: values.check_in_options.early_check_in_fee || 0
        },
        check_out_options: {
          time: values.policies.check_out_time || '11:00',
          late_check_out: values.check_out_options.late_check_out || false,
          late_check_out_fee: values.check_out_options.late_check_out_fee || 0
        }
      };
      
      // Send data to the API
      const response = await PropertyService.create(propertyData);
      
      // Navigate to the property detail page
      navigate(`/properties/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create property. Please try again.');
      console.error('Error creating property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Create Property
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/properties')}
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
                    label="Property Name"
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

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel id="category-label">Property Type</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.category && Boolean(errors.category)}
                        label="Property Type"
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

                    <FormControl fullWidth>
                      <InputLabel id="rating-label">Star Rating</InputLabel>
                      <Select
                        labelId="rating-label"
                        id="rating"
                        name="rating"
                        value={values.rating}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.rating && Boolean(errors.rating)}
                        label="Star Rating"
                      >
                        <MenuItem value={1}>1 Star</MenuItem>
                        <MenuItem value={2}>2 Star</MenuItem>
                        <MenuItem value={3}>3 Star</MenuItem>
                        <MenuItem value={4}>4 Star</MenuItem>
                        <MenuItem value={5}>5 Star</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        name="featured"
                        checked={values.featured}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Featured Property"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Location
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
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Pricing
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  />

                  <FormControl fullWidth>
                    <InputLabel id="price_type-label">Price Type</InputLabel>
                    <Select
                      labelId="price_type-label"
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

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="min_stay_nights"
                    name="min_stay_nights"
                    label="Minimum Stay (Nights)"
                    type="number"
                    value={values.min_stay_nights}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.min_stay_nights && Boolean(errors.min_stay_nights)}
                    helperText={touched.min_stay_nights && errors.min_stay_nights}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    id="date"
                    name="date"
                    label="Available From"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date && Boolean(errors.date)}
                    helperText={touched.date && errors.date}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Check-in & Check-out
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Check-in Time in Policies */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      id="policies.check_in_time"
                      name="policies.check_in_time"
                      label="Check-in Time Range"
                      value={values.policies.check_in_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText="Format: 14:00-22:00 (start-end time)"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />

                    <TextField
                      fullWidth
                      id="policies.check_out_time"
                      name="policies.check_out_time"
                      label="Check-out Time"
                      value={values.policies.check_out_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText="Format: 11:00"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Box>

                  {/* Check-in Options */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Check-in Options
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Configure additional check-in options and availability
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={values.check_in_options.early_check_in}
                          onChange={(e) => {
                            setFieldValue('check_in_options.early_check_in', e.target.checked);
                          }}
                        />
                      }
                      label="Allow Early Check-in"
                    />
                    
                    {values.check_in_options.early_check_in && (
                      <TextField
                        label="Early Check-in Fee ($)"
                        type="number"
                        value={values.check_in_options.early_check_in_fee}
                        onChange={(e) => {
                          setFieldValue('check_in_options.early_check_in_fee', 
                            e.target.value === '' ? 0 : Number(e.target.value));
                        }}
                        sx={{ ml: 4, mt: 1, width: 200 }}
                      />
                    )}
                  </Box>

                  {/* Check-out Options */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Check-out Options
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Configure additional check-out options and availability
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={values.check_out_options.late_check_out}
                          onChange={(e) => {
                            setFieldValue('check_out_options.late_check_out', e.target.checked);
                          }}
                        />
                      }
                      label="Allow Late Check-out"
                    />
                    
                    {values.check_out_options.late_check_out && (
                      <TextField
                        label="Late Check-out Fee ($)"
                        type="number"
                        value={values.check_out_options.late_check_out_fee}
                        onChange={(e) => {
                          setFieldValue('check_out_options.late_check_out_fee', 
                            e.target.value === '' ? 0 : Number(e.target.value));
                        }}
                        sx={{ ml: 4, mt: 1, width: 200 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Amenities & Highlights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Amenities
                    </Typography>
                    <FieldArray
                      name="amenities"
                      render={(arrayHelpers) => (
                        <Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {values.amenities.map((amenity, index) => (
                              <Chip
                                key={index}
                                label={amenity}
                                onDelete={() => arrayHelpers.remove(index)}
                                size="medium"
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              id="new-amenity"
                              label="Add Amenity"
                              variant="outlined"
                              size="small"
                              fullWidth
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    arrayHelpers.push(input.value.trim());
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <IconButton 
                              color="primary"
                              onClick={() => {
                                const input = document.getElementById('new-amenity') as HTMLInputElement;
                                if (input.value.trim()) {
                                  arrayHelpers.push(input.value.trim());
                                  input.value = '';
                                }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Highlights
                    </Typography>
                    <FieldArray
                      name="highlights"
                      render={(arrayHelpers) => (
                        <Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {values.highlights.map((highlight, index) => (
                              <Chip
                                key={index}
                                label={highlight}
                                onDelete={() => arrayHelpers.remove(index)}
                                size="medium"
                                color="secondary"
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              id="new-highlight"
                              label="Add Highlight"
                              variant="outlined"
                              size="small"
                              fullWidth
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    arrayHelpers.push(input.value.trim());
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <IconButton 
                              color="primary"
                              onClick={() => {
                                const input = document.getElementById('new-highlight') as HTMLInputElement;
                                if (input.value.trim()) {
                                  arrayHelpers.push(input.value.trim());
                                  input.value = '';
                                }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Policies
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="policies.cancellation"
                    name="policies.cancellation"
                    label="Cancellation Policy"
                    value={values.policies.cancellation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                    helperText="Example: Free cancellation up to 48 hours before check-in"
                  />

                  <TextField
                    fullWidth
                    id="policies.payment"
                    name="policies.payment"
                    label="Payment Policy"
                    value={values.policies.payment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    id="policies.other"
                    name="policies.other"
                    label="Other Policies"
                    value={values.policies.other}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                  
                  {/* Check-in and Check-out times now part of policies object */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Check-in Time Range</Typography>
                      <TextField
                        fullWidth
                        id="policies.check_in_time"
                        name="policies.check_in_time"
                        label="Check-in Time Range"
                        value={values.policies.check_in_time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        variant="outlined"
                        error={touched.policies?.check_in_time && Boolean(errors.policies?.check_in_time)}
                        helperText={(touched.policies?.check_in_time && errors.policies?.check_in_time) || "Format: 14:00-22:00"}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Check-out Time</Typography>
                      <TextField
                        fullWidth
                        id="policies.check_out_time"
                        name="policies.check_out_time"
                        label="Check-out Time"
                        value={values.policies.check_out_time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        variant="outlined"
                        error={touched.policies?.check_out_time && Boolean(errors.policies?.check_out_time)}
                        helperText={(touched.policies?.check_out_time && errors.policies?.check_out_time) || "Format: 11:00"}
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
                  render={(arrayHelpers) => (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        {values.house_rules.map((rule, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField
                              fullWidth
                              value={rule}
                              onChange={(e) => {
                                const newRules = [...values.house_rules];
                                newRules[index] = e.target.value;
                                setFieldValue('house_rules', newRules);
                              }}
                              variant="outlined"
                              size="small"
                              placeholder={`Rule ${index + 1}`}
                            />
                            <IconButton 
                              color="error" 
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => arrayHelpers.push('')}
                      >
                        Add House Rule
                      </Button>
                    </Box>
                  )}
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/properties')}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                >
                  {isSubmitting ? 'Creating Property...' : 'Create Property'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default PropertyCreate;
