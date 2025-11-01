import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, Feature, FeatureRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';
import { format } from 'date-fns';

const Features: React.FC = () => {
  console.log('Features component rendering');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<FeatureRequest>({
    heading: '',
    content: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 0,
  });
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  useEffect(() => {
    loadFeatures();
  }, [showActiveOnly]);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getFeatures(showActiveOnly);
      setFeatures(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load features', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        heading: feature.heading || '',
        content: feature.content || '',
        imageUrl: feature.imageUrl || '',
        isActive: feature.isActive ?? true,
        displayOrder: feature.displayOrder || 0,
      });
    } else {
      setEditingFeature(null);
      setFormData({
        heading: '',
        content: '',
        imageUrl: '',
        isActive: true,
        displayOrder: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFeature(null);
    setFormData({
      heading: '',
      content: '',
      imageUrl: '',
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingFeature?.id) {
        await cmsApi.updateFeature(editingFeature.id, formData);
      } else {
        await cmsApi.createFeature(formData);
      }
      handleCloseDialog();
      loadFeatures();
    } catch (err: any) {
      console.error('Failed to save feature', err);
      alert(err.response?.data?.message || 'Failed to save feature');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      await cmsApi.deleteFeature(id);
      loadFeatures();
    } catch (err: any) {
      console.error('Failed to delete feature', err);
      alert(err.response?.data?.message || 'Failed to delete feature');
    }
  };

  const handleImageUpload = async (id: number, file: File) => {
    setUploadingImage(id);
    try {
      const res = await cmsApi.uploadFeatureImage(id, file);
      if (res.payload?.imageUrl) {
        loadFeatures();
      }
    } catch (err: any) {
      console.error('Failed to upload image', err);
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  if (loading && features.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Features Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />}
              label="Active Only"
            />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadFeatures}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Add Feature
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Heading</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Display Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>{feature.id}</TableCell>
                  <TableCell>{feature.heading}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {feature.content || '-'}
                  </TableCell>
                  <TableCell>
                    {feature.imageUrl ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img src={feature.imageUrl} alt={feature.heading} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`image-upload-${feature.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(feature.id!, file);
                          }}
                        />
                        <label htmlFor={`image-upload-${feature.id}`}>
                          <IconButton component="span" size="small" disabled={uploadingImage === feature.id}>
                            <CloudUpload fontSize="small" />
                          </IconButton>
                        </label>
                      </Box>
                    ) : (
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`image-upload-${feature.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(feature.id!, file);
                          }}
                        />
                        <label htmlFor={`image-upload-${feature.id}`}>
                          <IconButton component="span" size="small" disabled={uploadingImage === feature.id}>
                            <ImageIcon fontSize="small" />
                          </IconButton>
                        </label>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{feature.displayOrder || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={feature.isActive ? 'Active' : 'Inactive'}
                      color={feature.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(feature)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(feature.id!)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {features.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body1">
                      No features found
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                      Click "Add Feature" to create your first feature
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Heading"
                fullWidth
                required
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              />
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <TextField
                label="Image URL"
                fullWidth
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                helperText="Or upload image using the upload button in the table"
              />
              <TextField
                label="Display Order"
                fullWidth
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingFeature ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default Features;

