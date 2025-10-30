import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Grid, Paper, Stack, Tab, Tabs, Typography, Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import Loading from '../components/common/Loading';
import { adminUserApi } from '../api/adminUserApi';
import SubscriptionHistoryTab from '../components/UserDetails/SubscriptionHistoryTab';
import ActivityTab from '../components/UserDetails/ActivityTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && <Box>{children}</Box>}
  </div>
);

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser(Number(id));
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    setLoading(true);
    try {
      const res = await adminUserApi.getUserById(userId);
      setUser(res.payload);
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!user) return <Layout><Typography>User not found</Typography></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')}>Back</Button>
          <Typography variant="h5" fontWeight={700}>User Details</Typography>
        </Box>

        {/* User Info Card */}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Shop ID</Typography>
                <Typography variant="body1" fontWeight={600}>{user.shopId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Store Name</Typography>
                <Typography variant="body1">{user.shopStoreName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{user.phone}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
                <Typography variant="body1">{user.GSTNumber || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={user.Status === 1 ? 'Active' : 'Inactive'} color={user.Status === 1 ? 'success' : 'default'} size="small" />
              </Grid>
              {user.shopAddress && (
                <>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">State</Typography>
                    <Typography variant="body1">{user.shopAddress.state || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">City</Typography>
                    <Typography variant="body1">{user.shopAddress.city || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Pincode</Typography>
                    <Typography variant="body1">{user.shopAddress.pincode || '-'}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Inventory" />
            <Tab label="Sales" />
            <Tab label="Bills" />
            <Tab label="Dues" />
            <Tab label="Subscriptions" />
            <Tab label="Accounts" />
            <Tab label="Customers" />
            <Tab label="Activity" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Typography>Inventory content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <Typography>Sales content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <Typography>Bills content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={3}>
            <Typography>Dues content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={4}>
            <SubscriptionHistoryTab userId={Number(id)} />
          </TabPanel>
          <TabPanel value={tab} index={5}>
            <Typography>Accounts content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={6}>
            <Typography>Customers content coming soon...</Typography>
          </TabPanel>
          <TabPanel value={tab} index={7}>
            <ActivityTab userId={Number(id)} />
          </TabPanel>
        </Paper>
      </Stack>
    </Layout>
  );
};

export default UserDetails;

