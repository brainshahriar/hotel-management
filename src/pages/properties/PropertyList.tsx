import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { PropertyService } from '../../services/propertyService';
import { Property } from '../../types/models';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);  useEffect(() => {
    fetchProperties();
  }, [page, rowsPerPage]); // Include page since we're using server-side pagination

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await PropertyService.getAll(rowsPerPage);
      
      // Handle the nested response structure
      if (response && response.success && response.data) {
        // Properties are in response.data.data
        setProperties(response.data.data || []);
        // Total count is in response.data.total
        setTotalCount(response.data.total || 0);
        
        // Update page if it exists in response
        if (response.data.current_page) {
          setPage(response.data.current_page - 1); // Convert 1-based to 0-based
        }
      } else {
        setProperties([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    fetchProperties(); // This will fetch the new page of data
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchProperties(); // This will fetch with the new rowsPerPage
  };

  const handleCreateProperty = () => {
    navigate('/properties/new');
  };

  const handleEditProperty = (id: number) => {
    navigate(`/properties/${id}/edit`);
  };

  const handleViewProperty = (id: number) => {
    navigate(`/properties/${id}`);
  };

  const handleViewRooms = (id: number) => {
    navigate(`/properties/${id}/rooms`);
  };

  const handleDeleteProperty = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await PropertyService.delete(id);
        // Refresh the properties list
        fetchProperties();
      } catch (err: any) {
        setError(err.message || 'Error deleting property');
        console.error('Error deleting property:', err);
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="600">
            Property Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your properties and their details
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<AddIcon />}
          onClick={handleCreateProperty}
          sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}<Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '10px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflowX: 'auto' }}>                <Table 
                  stickyHeader 
                  aria-label="properties table"
                  sx={{
                    '& .MuiTableCell-head': {
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                ><TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell align="center">Rooms</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>                <TableBody>                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <TableRow
                        key={property.id}
                        hover
                        onClick={() => handleViewProperty(property.id)}
                        sx={{ cursor: 'pointer' }}
                      >                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {property.title}
                            {property.featured && (
                              <Chip 
                                label="Featured" 
                                size="small" 
                                color="secondary"
                                sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {property.location}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={property.category} 
                            size="small" 
                            color={
                              property.category === 'Hotel' ? 'primary' :
                              property.category === 'Resort' ? 'secondary' :
                              property.category === 'Villa' ? 'success' :
                              'default'
                            } 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          {property.rating} ★
                        </TableCell>
                        <TableCell align="center">
                          {property.room_count || 0}
                        </TableCell>                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Manage Rooms">
                              <IconButton 
                                size="small"
                                color="primary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewRooms(property.id);
                                }}
                              >
                                <RoomIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Property">
                              <IconButton 
                                size="small"
                                color="info" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProperty(property.id);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Property">
                              <IconButton 
                                size="small"
                                color="error" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProperty(property.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) => {
                return `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`;
              }}
              sx={{ 
                borderTop: '1px solid #e0e0e0',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                },
                '.MuiTablePagination-select': {
                  fontSize: '0.875rem',
                }
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PropertyList;
