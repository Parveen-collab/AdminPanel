import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, HomePage, HomePageRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';

const HomePages: React.FC = () => {
  const [homePages, setHomePages] = useState<HomePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHomePage, setEditingHomePage] = useState<HomePage | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<HomePageRequest>({
    header: '',
    subHeading: '',
    content: '',
    imageUrl: '',
    customerRatings: 0,
    totalBusiness: 0,
    upTime: '',
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  useEffect(() => {
    loadHomePages();
  }, [showActiveOnly]);

  const loadHomePages = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getHomePages(showActiveOnly);
      setHomePages(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load home pages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (homePage?: HomePage) => {
    if (homePage) {
      setEditingHomePage(homePage);
      setFormData({
        header: homePage.header || '',
        subHeading: homePage.subHeading || '',
        content: homePage.content || '',
        imageUrl: homePage.imageUrl || '',
        customerRatings: homePage.customerRatings || 0,
        totalBusiness: homePage.totalBusiness || 0,
        upTime: homePage.upTime || '',
        isActive: homePage.isActive ?? true,
      });
    } else {
      setEditingHomePage(null);
      setFormData({
        header: '',
        subHeading: '',
        content: '',
        imageUrl: '',
        customerRatings: 0,
        totalBusiness: 0,
        upTime: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHomePage(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingHomePage?.id) {
        await cmsApi.updateHomePage(editingHomePage.id, formData);
      } else {
        await cmsApi.createHomePage(formData);
      }
      handleCloseDialog();
      loadHomePages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await cmsApi.deleteHomePage(id);
      loadHomePages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleImageUpload = async (id: number, file: File) => {
    setUploadingImage(id);
    try {
      await cmsApi.uploadHomePageImage(id, file);
      loadHomePages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload');
    } finally {
      setUploadingImage(null);
    }
  };

  if (loading && homePages.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Home Pages</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />}
              label="Active Only"
            />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadHomePages}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add</Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {homePages.map((hp) => (
            <Grid item xs={12} md={6} key={hp.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{hp.header}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(hp)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(hp.id!)} color="error"><Delete /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{hp.subHeading}</Typography>
                  {hp.imageUrl && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <img src={hp.imageUrl} alt={hp.header} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`img-${hp.id}`}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(hp.id!, file);
                        }}
                      />
                      <label htmlFor={`img-${hp.id}`}>
                        <Button component="span" size="small" startIcon={<CloudUpload />} sx={{ mt: 1 }}>
                          {uploadingImage === hp.id ? 'Uploading...' : 'Change Image'}
                        </Button>
                      </label>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Typography variant="body2"><strong>Ratings:</strong> {hp.customerRatings || 0}</Typography>
                    <Typography variant="body2"><strong>Business:</strong> {hp.totalBusiness || 0}</Typography>
                    <Typography variant="body2"><strong>Uptime:</strong> {hp.upTime || '-'}</Typography>
                  </Box>
                  <Chip label={hp.isActive ? 'Active' : 'Inactive'} color={hp.isActive ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {homePages.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                  No home page content found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Click "Add" to create your first home page content
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingHomePage ? 'Edit Home Page' : 'Add Home Page'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Header" fullWidth required value={formData.header} onChange={(e) => setFormData({ ...formData, header: e.target.value })} />
              <TextField label="Sub Heading" fullWidth value={formData.subHeading} onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })} />
              <TextField label="Content" fullWidth multiline rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
              <TextField label="Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField label="Customer Ratings" type="number" fullWidth value={formData.customerRatings} onChange={(e) => setFormData({ ...formData, customerRatings: parseFloat(e.target.value) || 0 })} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Total Business" type="number" fullWidth value={formData.totalBusiness} onChange={(e) => setFormData({ ...formData, totalBusiness: parseInt(e.target.value) || 0 })} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Uptime" fullWidth value={formData.upTime} onChange={(e) => setFormData({ ...formData, upTime: e.target.value })} />
                </Grid>
              </Grid>
              <FormControlLabel control={<Switch checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editingHomePage ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default HomePages;

