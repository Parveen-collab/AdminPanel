import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, CustomerReview, CustomerReviewRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';

const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<CustomerReviewRequest>({
    name: '', address: '', shopName: '', review: '', imageUrl: '', isActive: true, displayOrder: 0,
  });

  useEffect(() => {
    loadReviews();
  }, [showActiveOnly]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getCustomerReviews(showActiveOnly);
      setReviews(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (review?: CustomerReview) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        name: review.name || '', address: review.address || '', shopName: review.shopName || '',
        review: review.review || '', imageUrl: review.imageUrl || '', isActive: review.isActive ?? true,
        displayOrder: review.displayOrder || 0,
      });
    } else {
      setEditingReview(null);
      setFormData({ name: '', address: '', shopName: '', review: '', imageUrl: '', isActive: true, displayOrder: 0 });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingReview?.id) {
        await cmsApi.updateCustomerReview(editingReview.id, formData);
      } else {
        await cmsApi.createCustomerReview(formData);
      }
      setOpenDialog(false);
      loadReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await cmsApi.deleteCustomerReview(id);
      loadReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && reviews.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Customer Reviews</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />} label="Active Only" />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadReviews}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Review</Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{review.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{review.shopName}</Typography>
                      <Typography variant="caption" color="text.secondary">{review.address}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(review)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(review.id!)} color="error"><Delete /></IconButton>
                    </Box>
                  </Box>
                  {review.imageUrl ? (
                    <Box sx={{ mb: 2 }}>
                      <img src={review.imageUrl} alt={review.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`img-upload-${review.id}`}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && review.id) {
                            cmsApi.uploadCustomerReviewImage(review.id, file).then(() => loadReviews());
                          }
                        }}
                      />
                      <label htmlFor={`img-upload-${review.id}`}>
                        <Button component="span" size="small" startIcon={<CloudUpload />}>Change Image</Button>
                      </label>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`img-upload-${review.id}`}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && review.id) {
                            cmsApi.uploadCustomerReviewImage(review.id, file).then(() => loadReviews());
                          }
                        }}
                      />
                      <label htmlFor={`img-upload-${review.id}`}>
                        <Button component="span" size="small" startIcon={<CloudUpload />}>Upload Image</Button>
                      </label>
                    </Box>
                  )}
                  <Typography variant="body2">{review.review}</Typography>
                  <Chip label={review.isActive ? 'Active' : 'Inactive'} color={review.isActive ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {reviews.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                  No customer reviews found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Click "Add Review" to create your first customer review
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingReview ? 'Edit' : 'Add'} Customer Review</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Shop Name" fullWidth required value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} />
              <TextField label="Address" fullWidth value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <TextField label="Review" fullWidth required multiline rows={4} value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} />
              <TextField label="Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              <TextField label="Display Order" type="number" fullWidth value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} />
              <FormControlLabel control={<Switch checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editingReview ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default CustomerReviews;

