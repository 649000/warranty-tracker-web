'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Plus as PlusIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import { warrantyApi } from '@/services/warranty.service';
import { userProductApi } from '@/services/user-product.service';
import { companyApi } from '@/services/company.service';
import { Warranty } from '@/types/warranty.types';
import { UserProduct } from '@/types/user-product.types';

export default function WarrantiesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userProductId: 0,
    companyId: 0,
    startDate: new Date().toISOString().split('T')[0],
    warrantyPeriod: 365,
    warrantyType: 'Standard',
    notes: ''
  });

  // Fetch warranties
  const { data: warranties = [], isLoading: warrantiesLoading, error: warrantiesError } = useQuery({
    queryKey: ['warranties'],
    queryFn: warrantyApi.getUserWarranties,
  });

  // Fetch user products
  const { data: userProducts = [], isLoading: userProductsLoading } = useQuery({
    queryKey: ['userProducts'],
    queryFn: userProductApi.getUserProducts,
  });

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAllCompanies,
  });

  // Create warranty mutation
  const { mutate: createWarranty, isPending: isCreating } = useMutation({
    mutationFn: warrantyApi.createWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      setShowAddForm(false);
      setFormData({
        userProductId: 0,
        companyId: 0,
        startDate: new Date().toISOString().split('T')[0],
        warrantyPeriod: 365,
        warrantyType: 'Standard',
        notes: ''
      });
    },
    onError: (error: any) => {
      console.error('Error creating warranty:', error);
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedUserProduct = userProducts.find(up => up.id === formData.userProductId);
    const selectedCompany = companies.find(c => c.id === formData.companyId);
    if (!selectedUserProduct || !selectedCompany) return;

    // Calculate end date
    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + formData.warrantyPeriod);

    createWarranty({
      startDate: formData.startDate,
      endDate: endDateObj.toISOString().split('T')[0],
      warrantyPeriod: formData.warrantyPeriod,
      warrantyType: formData.warrantyType,
      notes: formData.notes,
      userProduct: selectedUserProduct,
      company: selectedCompany
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My Warranties
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Manage your product warranties and track expiration dates
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => setShowAddForm(true)}
              size="large"
            >
              Add Warranty
            </Button>
          </Stack>

          {/* Error Alert */}
          {warrantiesError && (
            <Alert severity="error">
              Failed to load warranties. Please try again.
            </Alert>
          )}

          {/* Warranties Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warrantiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : warranties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Stack alignItems="center" spacing={2}>
                          <ShieldIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                          <Typography variant="h6" color="text.secondary">
                            No warranties found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Get started by adding your first warranty.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<PlusIcon />}
                            onClick={() => setShowAddForm(true)}
                          >
                            Add Warranty
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    warranties.map((warranty) => {
                      const expired = isExpired(warranty.endDate);
                      const daysRemaining = getDaysRemaining(warranty.endDate);
                      
                      return (
                        <TableRow key={warranty.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {warranty.userProduct.product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                S/N: {warranty.userProduct.serialNumber}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {warranty.company.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(warranty.startDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {new Date(warranty.endDate).toLocaleDateString()}
                              </Typography>
                              {!expired && daysRemaining <= 30 && (
                                <Typography variant="caption" color="warning.main">
                                  {daysRemaining} days left
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {warranty.warrantyPeriod} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expired ? 'EXPIRED' : 'ACTIVE'}
                              color={getStatusColor(expired ? 'EXPIRED' : 'ACTIVE')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>

        {/* Add Warranty Dialog */}
        <Dialog
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { maxHeight: '90vh' } }}
        >
          <DialogTitle>Add New Warranty</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Product"
                    value={formData.userProductId}
                    onChange={(e) => setFormData({ ...formData, userProductId: parseInt(e.target.value) })}
                    required
                    disabled={userProductsLoading}
                  >
                    <MenuItem value="">Select a product</MenuItem>
                    {userProducts.map((userProduct) => (
                      <MenuItem key={userProduct.id} value={userProduct.id}>
                        {userProduct.product.name} - {userProduct.serialNumber}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Company"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: parseInt(e.target.value) })}
                    required
                    disabled={companiesLoading}
                  >
                    <MenuItem value="">Select a company</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Warranty Period (days)"
                    type="number"
                    value={formData.warrantyPeriod}
                    onChange={(e) => setFormData({ ...formData, warrantyPeriod: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Warranty Type"
                    value={formData.warrantyType}
                    onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : null}
              >
                {isCreating ? 'Saving...' : 'Save Warranty'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
}
