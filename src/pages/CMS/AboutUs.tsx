import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, AboutUs as AboutUsType, AboutUsRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';

const AboutUs: React.FC = () => {
  const [aboutUsList, setAboutUsList] = useState<AboutUsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutUsType | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<AboutUsRequest>({
    header: '', subHeader: '', content: '', imageUrl: '', isActive: true,
  });

  useEffect(() => {
    loadAboutUs();
  }, [showActiveOnly]);

  const loadAboutUs = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getAboutUs(showActiveOnly);
      setAboutUsList(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: AboutUsType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        header: item.header || '', subHeader: item.subHeader || '', content: item.content || '',
        imageUrl: item.imageUrl || '', isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({ header: '', subHeader: '', content: '', imageUrl: '', isActive: true });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem?.id) {
        await cmsApi.updateAboutUs(editingItem.id, formData);
      } else {
        await cmsApi.createAboutUs(formData);
      }
      setOpenDialog(false);
      loadAboutUs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await cmsApi.deleteAboutUs(id);
      loadAboutUs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && aboutUsList.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>About Us</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />} label="Active Only" />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadAboutUs}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add</Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {aboutUsList.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5">{item.header}</Typography>
                      <Typography variant="h6" color="text.secondary">{item.subHeader}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id!)} color="error"><Delete /></IconButton>
                    </Box>
                  </Box>
                  {item.imageUrl && (
                    <Box sx={{ mb: 2 }}>
                      <img src={item.imageUrl} alt={item.header} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`img-${item.id}`}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && item.id) cmsApi.uploadAboutUsImage(item.id, file).then(() => loadAboutUs());
                        }}
                      />
                      <label htmlFor={`img-${item.id}`}>
                        <Button component="span" size="small" startIcon={<CloudUpload />} sx={{ mt: 1 }}>Change Image</Button>
                      </label>
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ mb: 2 }}>{item.content}</Typography>
                  <Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {aboutUsList.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                  No about us content found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Click "Add" to create your first about us content
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit' : 'Add'} About Us</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Header" fullWidth required value={formData.header} onChange={(e) => setFormData({ ...formData, header: e.target.value })} />
              <TextField label="Sub Header" fullWidth value={formData.subHeader} onChange={(e) => setFormData({ ...formData, subHeader: e.target.value })} />
              <TextField label="Content" fullWidth multiline rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
              <TextField label="Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              <FormControlLabel control={<Switch checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editingItem ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default AboutUs;

