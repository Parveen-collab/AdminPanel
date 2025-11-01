import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, ShopInAction, ShopInActionRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';

const ShopInActions: React.FC = () => {
  const [items, setItems] = useState<ShopInAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopInAction | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<ShopInActionRequest>({
    heading: '', content: '', imageUrl: '', isActive: true, displayOrder: 0,
  });

  useEffect(() => {
    loadItems();
  }, [showActiveOnly]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getShopInActions(showActiveOnly);
      setItems(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: ShopInAction) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        heading: item.heading || '', content: item.content || '', imageUrl: item.imageUrl || '',
        isActive: item.isActive ?? true, displayOrder: item.displayOrder || 0,
      });
    } else {
      setEditingItem(null);
      setFormData({ heading: '', content: '', imageUrl: '', isActive: true, displayOrder: 0 });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem?.id) {
        await cmsApi.updateShopInAction(editingItem.id, formData);
      } else {
        await cmsApi.createShopInAction(formData);
      }
      setOpenDialog(false);
      loadItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await cmsApi.deleteShopInAction(id);
      loadItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && items.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Shop In Action</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />} label="Active Only" />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadItems}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add</Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell><TableCell>Heading</TableCell><TableCell>Content</TableCell>
                <TableCell>Image</TableCell><TableCell>Order</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.heading}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.content || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`img-upload-${item.id}`}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && item.id) {
                            cmsApi.uploadShopInActionImage(item.id, file).then(() => loadItems());
                          }
                        }}
                      />
                      <label htmlFor={`img-upload-${item.id}`}>
                        <IconButton component="span" size="small"><CloudUpload fontSize="small" /></IconButton>
                      </label>
                    </Box>
                  </TableCell>
                  <TableCell>{item.displayOrder || '-'}</TableCell>
                  <TableCell><Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id!)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body1">
                      No shop in action items found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit' : 'Add'} Shop In Action</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Heading" fullWidth required value={formData.heading} onChange={(e) => setFormData({ ...formData, heading: e.target.value })} />
              <TextField label="Content" fullWidth multiline rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
              <TextField label="Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              <TextField label="Display Order" type="number" fullWidth value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} />
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

export default ShopInActions;

