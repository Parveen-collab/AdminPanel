import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel, Switch
} from '@mui/material';
import { Refresh, Delete, Visibility, MarkEmailRead } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, Enquiry } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';
import { format } from 'date-fns';

const Enquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, [showUnreadOnly]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getEnquiries(showUnreadOnly);
      setEnquiries(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setOpenDialog(true);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await cmsApi.markEnquiryAsRead(id);
      loadEnquiries();
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, isRead: true });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await cmsApi.deleteEnquiry(id);
      loadEnquiries();
      if (selectedEnquiry?.id === id) {
        setOpenDialog(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && enquiries.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Enquiries</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} />}
              label="Unread Only"
            />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadEnquiries}>Refresh</Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Shop Name</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id} sx={{ bgcolor: !enquiry.isRead ? 'action.hover' : 'transparent' }}>
                  <TableCell>{enquiry.id}</TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>{enquiry.phoneNo}</TableCell>
                  <TableCell>{enquiry.shopName || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {enquiry.message}
                  </TableCell>
                  <TableCell>
                    {enquiry.createdAt ? format(new Date(enquiry.createdAt), 'dd MMM yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={enquiry.isRead ? 'Read' : 'Unread'}
                      color={enquiry.isRead ? 'default' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleView(enquiry)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    {!enquiry.isRead && (
                      <IconButton size="small" onClick={() => handleMarkAsRead(enquiry.id!)} color="success">
                        <MarkEmailRead fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleDelete(enquiry.id!)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {enquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body1">
                      No enquiries found
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                      Customer enquiries will appear here when submitted from the website
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Enquiry Details</DialogTitle>
          <DialogContent>
            {selectedEnquiry && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedEnquiry.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedEnquiry.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedEnquiry.phoneNo}</Typography>
                </Box>
                {selectedEnquiry.shopName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shop Name</Typography>
                    <Typography variant="body1">{selectedEnquiry.shopName}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Message</Typography>
                  <Typography variant="body1" sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    {selectedEnquiry.message}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {selectedEnquiry.createdAt ? format(new Date(selectedEnquiry.createdAt), 'dd MMM yyyy HH:mm') : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Chip
                    label={selectedEnquiry.isRead ? 'Read' : 'Unread'}
                    color={selectedEnquiry.isRead ? 'default' : 'warning'}
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            {selectedEnquiry && !selectedEnquiry.isRead && (
              <Button
                startIcon={<MarkEmailRead />}
                onClick={() => {
                  handleMarkAsRead(selectedEnquiry.id!);
                  setOpenDialog(false);
                }}
              >
                Mark as Read
              </Button>
            )}
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default Enquiries;

