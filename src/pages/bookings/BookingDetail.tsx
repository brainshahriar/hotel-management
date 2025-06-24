import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Chip,
    Button,
    Divider,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Hotel as HotelIcon,
    MeetingRoom as RoomIcon,
    Event as EventIcon,
    EventAvailable as CheckOutIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    CreditCard as PaymentIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    Print as PrintIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

// This would come from API in a real application
const dummyBooking = {
    id: 1001,
    guestName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    property: 'Seaside Resort',
    roomType: 'Deluxe Ocean View',
    roomNumber: '304',
    checkIn: '2025-06-25',
    checkOut: '2025-06-30',
    adults: 2,
    children: 1,
    totalAmount: 1250.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    specialRequests: 'Early check-in requested. Prefer high floor with ocean view if possible.',
    createdAt: '2025-05-15T14:22:38Z',
    notes: [
        { date: '2025-05-15', note: 'Booking created', user: 'System' },
        { date: '2025-05-16', note: 'Guest requested airport pickup service', user: 'Jane (Reservations)' },
        { date: '2025-05-20', note: 'Confirmed early check-in availability', user: 'Mark (Front Desk)' }
    ]
};

interface BookingDetailProps {
    bookingId?: string;
}

const BookingDetail: React.FC<BookingDetailProps> = ({ bookingId }) => {
    // In a real app, we'd fetch the booking data using the bookingId
    const { id } = useParams<{ id: string }>();
    const actualBookingId = bookingId || id;

    // State for dialogs
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openAddNoteDialog, setOpenAddNoteDialog] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [bookingData, setBookingData] = useState(dummyBooking);
    // Since we have strings for dates, we'll use a fixed value for nights
    const nights = 5;

    // Get appropriate color for status chip
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'primary';
            default: return 'default';
        }
    };

    // Get appropriate color for payment status chip
    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'partial': return 'warning';
            case 'unpaid': return 'error';
            case 'refunded': return 'info';
            default: return 'default';
        }
    };

    // Handle booking cancellation
    const handleCancelBooking = () => {
        setBookingData({
            ...bookingData,
            status: 'cancelled'
        });
        setOpenCancelDialog(false);
    };

    // Handle adding a note
    const handleAddNote = () => {
        if (newNote.trim()) {
            const updatedBooking = {
                ...bookingData,
                notes: [
                    ...bookingData.notes,
                    {
                        date: new Date().toISOString().split('T')[0],
                        note: newNote.trim(),
                        user: 'Current User' // In a real app, this would be the logged-in user
                    }
                ]
            };
            setBookingData(updatedBooking);
            setNewNote('');
            setOpenAddNoteDialog(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Booking #{actualBookingId || bookingData.id}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                            label={bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
                            color={getStatusColor(bookingData.status) as any}
                        />
                        <Typography variant="body2">
                            Created on {new Date(bookingData.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        color="primary"
                    >
                        Edit Booking
                    </Button>
                    {bookingData.status !== 'cancelled' && (
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            color="error"
                            onClick={() => setOpenCancelDialog(true)}
                        >
                            Cancel Booking
                        </Button>
                    )}
                </Box>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Main Booking Details */}
                <Box flex={{ xs: '1', md: '2' }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Booking Details
                        </Typography>

                        <Stack spacing={3}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Box flex={1}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                Guest Information
                                            </Typography>
                                            <List dense disablePadding>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <PersonIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={bookingData.guestName} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <EmailIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={bookingData.email} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <PhoneIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={bookingData.phone} />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>

                                <Box flex={1}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                Accommodation
                                            </Typography>
                                            <List dense disablePadding>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <HotelIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={bookingData.property} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <RoomIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={`${bookingData.roomType} (Room ${bookingData.roomNumber})`}
                                                    />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <PeopleIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={`${bookingData.adults} Adults, ${bookingData.children} Children`}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Box flex={1}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                Stay Details
                                            </Typography>
                                            <List dense disablePadding>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <EventIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Check In"
                                                        secondary={bookingData.checkIn}
                                                    />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <CheckOutIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Check Out"
                                                        secondary={bookingData.checkOut}
                                                    />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemText
                                                        primary={`${nights} Nights`}
                                                        sx={{ pl: 4.5 }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>

                                <Box flex={1}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                Payment Information
                                            </Typography>
                                            <List dense disablePadding>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <ReceiptIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Total Amount"
                                                        secondary={`$${bookingData.totalAmount.toFixed(2)}`}
                                                    />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <PaymentIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Payment Method"
                                                        secondary={bookingData.paymentMethod}
                                                    />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <ListItemText
                                                        primary="Payment Status"
                                                        secondary={
                                                            <Chip
                                                                label={bookingData.paymentStatus.charAt(0).toUpperCase() + bookingData.paymentStatus.slice(1)}
                                                                color={getPaymentStatusColor(bookingData.paymentStatus) as any}
                                                                size="small"
                                                                sx={{ mt: 0.5 }}
                                                            />
                                                        }
                                                        sx={{ pl: 4.5 }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Stack>
                        </Stack>

                        {bookingData.specialRequests && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Special Requests
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="body2">
                                        {bookingData.specialRequests}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Sidebar */}
                <Box flex={{ xs: '1', md: '1' }}>
                    {/* Booking Notes */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Booking Notes
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => setOpenAddNoteDialog(true)}
                            >
                                Add Note
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {bookingData.notes && bookingData.notes.length > 0 ? (
                            bookingData.notes.map((note, index) => (
                                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < bookingData.notes.length - 1 ? '1px solid #eee' : 'none' }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {note.date} - {note.user}
                                    </Typography>
                                    <Typography variant="body2">
                                        {note.note}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No notes for this booking yet.
                            </Typography>
                        )}
                    </Paper>

                    {/* Quick Actions */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button variant="outlined" fullWidth>
                                Send Confirmation Email
                            </Button>
                            <Button variant="outlined" fullWidth>
                                Add Room Upgrade
                            </Button>
                            <Button variant="outlined" fullWidth>
                                Add Special Service
                            </Button>
                            <Button variant="outlined" fullWidth>
                                Process Payment
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Stack>

            {/* Cancel Booking Dialog */}
            <Dialog
                open={openCancelDialog}
                onClose={() => setOpenCancelDialog(false)}
            >
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone.
                    </Alert>
                    <Typography>
                        Are you sure you want to cancel the booking for {bookingData.guestName}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCancelDialog(false)}>
                        Keep Booking
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelBooking}
                    >
                        Cancel Booking
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog
                open={openAddNoteDialog}
                onClose={() => setOpenAddNoteDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Booking Note</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Enter your note here..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                minHeight: '100px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontFamily: 'inherit',
                                fontSize: 'inherit'
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddNoteDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                    >
                        Add Note
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingDetail;
