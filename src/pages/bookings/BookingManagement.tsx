import React, { useState } from 'react';
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
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Date formatting utility
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Types
interface Booking {
  id: number;
  guestName: string;
  email: string;
  phone: string;
  property: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'refunded';
  createdAt: string;
}

// New booking types
interface NewBooking {
  guestName: string;
  email: string;
  phone: string;
  property: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'confirmed' | 'pending';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
}

const initialNewBooking: NewBooking = {
  guestName: '',
  email: '',
  phone: '',
  property: '',
  roomType: '',
  checkIn: '',
  checkOut: '',
  adults: 1,
  children: 0,
  totalAmount: 0,
  status: 'pending',
  paymentStatus: 'unpaid'
};

// Property and room options
const propertyOptions = [
  'Seaside Resort',
  'Mountain Lodge',
  'City Center Hotel'
];

const roomTypeOptions = {
  'Seaside Resort': ['Deluxe Ocean View', 'Family Suite', 'Beach Villa'],
  'Mountain Lodge': ['Premium Suite', 'Cabin', 'Mountain View Room'],
  'City Center Hotel': ['Standard Room', 'Executive Suite', 'Business Room']
};

// Dummy data for bookings
const dummyBookings: Booking[] = [
  {
    id: 1001,
    guestName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    property: 'Seaside Resort',
    roomType: 'Deluxe Ocean View',
    checkIn: '2025-06-25',
    checkOut: '2025-06-30',
    adults: 2,
    children: 1,
    totalAmount: 1250.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2025-05-15T14:22:38Z'
  },
  {
    id: 1002,
    guestName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    property: 'Mountain Lodge',
    roomType: 'Premium Suite',
    checkIn: '2025-07-10',
    checkOut: '2025-07-15',
    adults: 2,
    children: 0,
    totalAmount: 1800.00,
    status: 'pending',
    paymentStatus: 'partial',
    createdAt: '2025-06-01T09:15:22Z'
  },
  {
    id: 1003,
    guestName: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 (555) 456-7890',
    property: 'City Center Hotel',
    roomType: 'Standard Room',
    checkIn: '2025-06-18',
    checkOut: '2025-06-20',
    adults: 1,
    children: 0,
    totalAmount: 420.00,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2025-05-30T16:42:11Z'
  },
  {
    id: 1004,
    guestName: 'Maria Garcia',
    email: 'maria.g@example.com',
    phone: '+1 (555) 789-0123',
    property: 'Seaside Resort',
    roomType: 'Family Suite',
    checkIn: '2025-07-05',
    checkOut: '2025-07-12',
    adults: 2,
    children: 2,
    totalAmount: 2100.00,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    createdAt: '2025-06-10T11:33:45Z'
  },
  {
    id: 1005,
    guestName: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 234-5678',
    property: 'Mountain Lodge',
    roomType: 'Cabin',
    checkIn: '2025-08-15',
    checkOut: '2025-08-20',
    adults: 4,
    children: 1,
    totalAmount: 1950.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2025-06-12T14:58:22Z'
  },
  {
    id: 1006,
    guestName: 'Lisa Brown',
    email: 'lisa.b@example.com',
    phone: '+1 (555) 876-5432',
    property: 'City Center Hotel',
    roomType: 'Executive Suite',
    checkIn: '2025-06-20',
    checkOut: '2025-06-23',
    adults: 2,
    children: 0,
    totalAmount: 980.00,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2025-05-22T08:17:36Z'
  }
];

const BookingManagement: React.FC = () => {
  // State variables
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openNewBookingDialog, setOpenNewBookingDialog] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBooking, setNewBooking] = useState<NewBooking>(initialNewBooking);
  const [bookingError, setBookingError] = useState<string>('');

  // Validate the new booking form
  const isValidBooking = () => {
    return (
      newBooking.guestName.trim() !== '' &&
      newBooking.email.trim() !== '' &&
      newBooking.phone.trim() !== '' &&
      newBooking.property !== '' &&
      newBooking.roomType !== '' &&
      newBooking.checkIn !== '' &&
      newBooking.checkOut !== '' &&
      newBooking.adults >= 1 &&
      newBooking.totalAmount > 0 &&
      new Date(newBooking.checkIn) < new Date(newBooking.checkOut)
    );
  };

  // Handle creating a new booking
  const handleCreateBooking = () => {
    if (!isValidBooking()) {
      setBookingError('Please fill in all required fields correctly.');
      return;
    }

    // Validate dates
    const checkIn = new Date(newBooking.checkIn);
    const checkOut = new Date(newBooking.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setBookingError('Check-in date cannot be in the past.');
      return;
    }

    if (checkOut <= checkIn) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }

    // Create new booking object
    const newBookingEntry: Booking = {
      id: Math.max(...bookings.map(b => b.id), 0) + 1,
      ...newBooking,
      status: newBooking.status,
      paymentStatus: newBooking.paymentStatus,
      createdAt: new Date().toISOString()
    };

    // Add to bookings list
    setBookings([newBookingEntry, ...bookings]);
    
    // Close dialog and reset form
    setOpenNewBookingDialog(false);
    setNewBooking(initialNewBooking);
    setBookingError('');
  };

  // Get filtered bookings based on tab and search
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Filter by tab/status
    if (currentTabValue === 1) filtered = filtered.filter(b => b.status === 'confirmed');
    if (currentTabValue === 2) filtered = filtered.filter(b => b.status === 'pending');
    if (currentTabValue === 3) filtered = filtered.filter(b => b.status === 'completed');
    if (currentTabValue === 4) filtered = filtered.filter(b => b.status === 'cancelled');
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.guestName.toLowerCase().includes(query) || 
        b.email.toLowerCase().includes(query) || 
        b.property.toLowerCase().includes(query) || 
        b.id.toString().includes(query)
      );
    }
    
    return filtered;
  };

  // Handle status change
  const handleStatusChange = (bookingId: number, newStatus: Booking['status']) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    setBookings(updatedBookings);
  };

  // Get appropriate color for status chip
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  // Get appropriate color for payment status chip
  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  // Handle new booking form submission
  const handleNewBookingSubmit = () => {
    // Basic validation
    if (!newBooking.guestName || !newBooking.email || !newBooking.phone) {
      setBookingError('Please fill in all required fields.');
      return;
    }

    // Create new booking object
    const bookingId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1001;
    const newBookingEntry: Booking = {
      id: bookingId,
      ...newBooking,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      totalAmount: newBooking.totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString()
    };

    // Update state
    setBookings([...bookings, newBookingEntry]);
    setOpenNewBookingDialog(false);
    setNewBooking(initialNewBooking);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => {
            setNewBooking(initialNewBooking);
            setOpenNewBookingDialog(true);
            setBookingError('');
          }}
        >
          New Booking
        </Button>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Box flex={{ md: 2 }}>
            <Tabs 
              value={currentTabValue} 
              onChange={(_, newValue) => setCurrentTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All Bookings" />
              <Tab label="Confirmed" />
              <Tab label="Pending" />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Box>
          <Box flex={{ md: 1 }}>
            <TextField
              placeholder="Search bookings..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Bookings Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredBookings().map((booking) => (
              <TableRow key={booking.id} hover>
                <TableCell>#{booking.id}</TableCell>
                <TableCell>{booking.guestName}</TableCell>
                <TableCell>{booking.property}</TableCell>
                <TableCell>{formatDate(booking.checkIn)}</TableCell>
                <TableCell>{formatDate(booking.checkOut)}</TableCell>
                <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                    color={getStatusColor(booking.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)} 
                    color={getPaymentStatusColor(booking.paymentStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setOpenViewDialog(true);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Booking">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel Booking">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {getFilteredBookings().length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No bookings found matching your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Booking Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6">
                Booking #{selectedBooking.id}
                <Chip 
                  label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)} 
                  color={getStatusColor(selectedBooking.status) as any}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Typography>              <Typography variant="body2" color="textSecondary">
                Created on {formatDate(selectedBooking.createdAt)}
              </Typography>
            </DialogTitle>            <DialogContent dividers>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Guest Information</Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="body1">{selectedBooking.guestName}</Typography>
                    <Typography variant="body2">{selectedBooking.email}</Typography>
                    <Typography variant="body2">{selectedBooking.phone}</Typography>
                  </Stack>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Stay Details</Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Check-in:</strong> {formatDate(selectedBooking.checkIn)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Check-out:</strong> {formatDate(selectedBooking.checkOut)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nights:</strong> {Math.ceil((new Date(selectedBooking.checkOut).getTime() - new Date(selectedBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Guests:</strong> {selectedBooking.adults} adults, {selectedBooking.children} children
                    </Typography>
                  </Stack>
                </Box>

                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Accommodation</Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="body1">{selectedBooking.property}</Typography>
                    <Typography variant="body2">{selectedBooking.roomType}</Typography>
                  </Stack>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Payment Information</Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Total Amount:</strong> ${selectedBooking.totalAmount.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Payment Status:</strong>
                      </Typography>
                      <Chip 
                        label={selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)} 
                        color={getPaymentStatusColor(selectedBooking.paymentStatus) as any}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Box>
                {selectedBooking.status !== 'cancelled' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'cancelled');
                      setOpenViewDialog(false);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
              </Box>
              <Box>
                <Button onClick={() => setOpenViewDialog(false)}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOpenViewDialog(false);
                    setOpenEditDialog(true);
                  }}
                >
                  Edit
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Booking Dialog - Simplified for the example */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>Edit Booking #{selectedBooking.id}</DialogTitle>            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Guest Information */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Guest Information</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Guest Name"
                      fullWidth
                      defaultValue={selectedBooking.guestName}
                    />
                    <TextField
                      label="Email"
                      fullWidth
                      defaultValue={selectedBooking.email}
                      type="email"
                    />
                    <TextField
                      label="Phone"
                      fullWidth
                      defaultValue={selectedBooking.phone}
                    />
                  </Stack>
                </Box>

                {/* Property Information */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Property Information</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Property"
                      fullWidth
                      defaultValue={selectedBooking.property}
                    />
                    <TextField
                      label="Room Type"
                      fullWidth
                      defaultValue={selectedBooking.roomType}
                    />
                  </Stack>
                </Box>

                {/* Booking Status */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Booking Status</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="Status"
                      fullWidth
                      defaultValue={selectedBooking.status}
                    >
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Payment Status"
                      fullWidth
                      defaultValue={selectedBooking.paymentStatus}
                    >
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </TextField>
                  </Stack>
                </Box>

                {/* Dates */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Stay Dates</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Check-In Date"
                      type="date"
                      fullWidth
                      defaultValue={selectedBooking.checkIn}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Check-Out Date"
                      type="date"
                      fullWidth
                      defaultValue={selectedBooking.checkOut}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </Box>

                {/* Guests and Amount */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Guests & Payment</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Adults"
                      type="number"
                      fullWidth
                      defaultValue={selectedBooking.adults}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                    <TextField
                      label="Children"
                      type="number"
                      fullWidth
                      defaultValue={selectedBooking.children}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                    <TextField
                      label="Total Amount ($)"
                      type="number"
                      fullWidth
                      defaultValue={selectedBooking.totalAmount}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // In a real app, we'd update the booking here
                  alert('Booking would be updated here');
                  setOpenEditDialog(false);
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete/Cancel Booking Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        {selectedBooking && (
          <>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to cancel booking #{selectedBooking.id} for {selectedBooking.guestName}?
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Keep Booking</Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  handleStatusChange(selectedBooking.id, 'cancelled');
                  setOpenDeleteDialog(false);
                }}
              >
                Cancel Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* New Booking Dialog */}
      <Dialog
        open={openNewBookingDialog}
        onClose={() => setOpenNewBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {bookingError && (
              <Alert severity="error" onClose={() => setBookingError('')}>
                {bookingError}
              </Alert>
            )}

            {/* Guest Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Guest Information</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Guest Name"
                  fullWidth
                  required
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  required
                  type="email"
                  value={newBooking.email}
                  onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  required
                  value={newBooking.phone}
                  onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                />
              </Stack>
            </Box>

            {/* Property Information */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Property & Room</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Property"
                  fullWidth
                  required
                  value={newBooking.property}
                  onChange={(e) => {
                    setNewBooking({
                      ...newBooking,
                      property: e.target.value,
                      roomType: '' // Reset room type when property changes
                    });
                  }}
                >
                  {propertyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Room Type"
                  fullWidth
                  required
                  value={newBooking.roomType}
                  disabled={!newBooking.property}
                  onChange={(e) => setNewBooking({ ...newBooking, roomType: e.target.value })}
                >
                  {newBooking.property && roomTypeOptions[newBooking.property as keyof typeof roomTypeOptions].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Box>

            {/* Stay Details */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Stay Details</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Check-in Date"
                  type="date"
                  fullWidth
                  required
                  value={newBooking.checkIn}
                  onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Check-out Date"
                  type="date"
                  fullWidth
                  required
                  value={newBooking.checkOut}
                  onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Box>

            {/* Guests & Payment */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Guests & Payment</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Adults"
                  type="number"
                  fullWidth
                  required
                  value={newBooking.adults}
                  onChange={(e) => setNewBooking({ ...newBooking, adults: parseInt(e.target.value) || 1 })}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="Children"
                  type="number"
                  fullWidth
                  value={newBooking.children}
                  onChange={(e) => setNewBooking({ ...newBooking, children: parseInt(e.target.value) || 0 })}
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <TextField
                  label="Total Amount ($)"
                  type="number"
                  fullWidth
                  required
                  value={newBooking.totalAmount}
                  onChange={(e) => setNewBooking({ ...newBooking, totalAmount: parseFloat(e.target.value) || 0 })}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Stack>
            </Box>

            {/* Status */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Booking Status</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Booking Status"
                  fullWidth
                  required
                  value={newBooking.status}
                  onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value as 'confirmed' | 'pending' })}
                >
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Payment Status"
                  fullWidth
                  required
                  value={newBooking.paymentStatus}
                  onChange={(e) => setNewBooking({ ...newBooking, paymentStatus: e.target.value as 'paid' | 'partial' | 'unpaid' })}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </TextField>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewBookingDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBooking}
            disabled={!isValidBooking()}
          >
            Create Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingManagement;
