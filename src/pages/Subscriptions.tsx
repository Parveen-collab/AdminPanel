import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Grid, Paper, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Card, CardContent
} from '@mui/material';
import { Add, CheckCircleOutline, AccessTime, CalendarToday, ManageAccounts, TrendingUp, LocalOffer, Settings } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { subscriptionApi, SubscriptionPlan } from '../api/subscriptionApi';
import Loading from '../components/common/Loading';
import { LineChartComponent } from '../components/Charts/LineChart';
import { PieChartComponent } from '../components/Charts/PieChart';
import { format } from 'date-fns';

const Subscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [form, setForm] = useState<SubscriptionPlan>({ code: '', name: '', priceMonthly: 0, priceYearly: 0, trialDays: 0, description: '' });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await subscriptionApi.listPlans();
      setPlans(res.payload || []);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await subscriptionApi.analyticsSummary(startDate, endDate);
      if (res.payload) {
        setStats(res.payload);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);
  useEffect(() => { if (startDate && endDate) loadStats(); }, [startDate, endDate]);

  const savePlan = async () => {
    await subscriptionApi.upsertPlan(form);
    setShowAddPlan(false);
    setForm({ code: '', name: '', priceMonthly: 0, priceYearly: 0, trialDays: 0, description: '' });
    loadPlans();
  };


  const monthlyData = (stats.monthlyRevenue || []).map((m: any[]) => ({
    name: m[0] || '',
    users: Number(m[1] || 0)
  }));

  const planDistRaw = (stats.activeByPlan || []).map((p: any[]) => ({
    name: p[0] || 'Unknown',
    value: Number(p[1] || 0)
  }));
  const totalSubs = planDistRaw.reduce((sum, p) => sum + p.value, 0);
  const planDist = planDistRaw.map(p => ({
    ...p,
    percentage: totalSubs > 0 ? (p.value / totalSubs) * 100 : 0
  }));

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>Subscription Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowAddPlan(true)}>Add Plan</Button>
        </Box>

        {/* Default Plan Endpoints Management Card */}
        <Paper 
          sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Default Plan Endpoints Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all available API endpoints and assign them to subscription plans. 
                  Select endpoints with checkboxes and assign to TRIAL or other plans.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => navigate('/subscriptions/manage/TRIAL')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Manage Default Plan Endpoints
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip 
                label="All endpoints listed with checkboxes" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
              <Chip 
                label="Easy update & management" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
              <Chip 
                label="Categorized by feature" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Plans</Typography>
                <Typography variant="h4">{plans.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Active Subscriptions</Typography>
                <Typography variant="h4">{stats.subscriptions || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h4">₹{(stats.monthlyRevenue || []).reduce((sum: number, m: any[]) => sum + (Number(m[1] || 0)), 0).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Trials Expiring</Typography>
                <Typography variant="h4">{stats.trialsExpiringSoon || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Date Filters */}
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Button variant="outlined" onClick={loadStats}>Refresh Stats</Button>
          </Stack>
        </Paper>

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Monthly Revenue</Typography>
              {loading ? <Loading /> : <LineChartComponent data={monthlyData} />}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Subscriptions by Plan</Typography>
              {loading ? <Loading /> : <PieChartComponent data={planDist} />}
            </Paper>
          </Grid>
        </Grid>

        {/* Plans Cards */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>Subscription Plans</Typography>
          {loading ? <Loading /> : (
            <Grid container spacing={3}>
              {plans.map((p, idx) => {
                const colors = [
                  { primary: '#1976d2', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { primary: '#2e7d32', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                  { primary: '#ed6c02', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                  { primary: '#d32f2f', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                  { primary: '#0288d1', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                  { primary: '#7b1fa2', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
                ];
                const colorScheme = colors[idx % colors.length];
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.code}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'visible',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                        border: `2px solid ${p.active ? colorScheme.primary : '#e0e0e0'}`,
                        borderRadius: 3,
                      }}
                    >
                      {/* Header with gradient */}
                      <Box
                        sx={{
                          background: p.active ? colorScheme.gradient : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                          color: 'white',
                          p: 2,
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip
                            label={p.code}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              fontWeight: 700,
                              backdropFilter: 'blur(10px)',
                            }}
                          />
                          <Chip
                            icon={p.active ? <CheckCircleOutline sx={{ fontSize: 16 }} /> : undefined}
                            label={p.active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: p.active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                          {p.name}
                        </Typography>
                        {p.description && (
                          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9, fontSize: '0.85rem' }}>
                            {p.description}
                          </Typography>
                        )}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        {/* Pricing */}
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <LocalOffer sx={{ fontSize: 14 }} /> Monthly Price
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color={colorScheme.primary}>
                              ₹{p.priceMonthly?.toLocaleString() || 0}
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                /month
                              </Typography>
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <TrendingUp sx={{ fontSize: 14 }} /> Yearly Price
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color={colorScheme.primary}>
                              ₹{p.priceYearly?.toLocaleString() || 0}
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                /year
                              </Typography>
                            </Typography>
                            {p.priceYearly && p.priceMonthly && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                Save ₹{((p.priceMonthly * 12) - p.priceYearly).toLocaleString()}/year
                              </Typography>
                            )}
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              bgcolor: 'action.hover',
                              borderRadius: 2,
                            }}
                          >
                            <AccessTime sx={{ fontSize: 18, color: colorScheme.primary }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Trial Period
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {p.trialDays || 0} days
                              </Typography>
                            </Box>
                          </Box>

                          {p.createdAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Created: {format(new Date(p.createdAt), 'dd MMM yyyy')}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ManageAccounts />}
                          onClick={() => navigate(`/subscriptions/manage/${p.code}`)}
                          sx={{
                            bgcolor: colorScheme.primary,
                            '&:hover': { bgcolor: colorScheme.primary, opacity: 0.9 },
                            borderRadius: 2,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Manage Endpoints
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
              {plans.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">No subscription plans found</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Box>

        {/* Add Plan Dialog */}
        <Dialog open={showAddPlan} onClose={() => setShowAddPlan(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Plan</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Code" fullWidth size="small" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <TextField label="Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Monthly Price" type="number" fullWidth size="small" value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: Number(e.target.value) })} /></Grid>
                <Grid item xs={6}><TextField label="Yearly Price" type="number" fullWidth size="small" value={form.priceYearly} onChange={e => setForm({ ...form, priceYearly: Number(e.target.value) })} /></Grid>
              </Grid>
              <TextField label="Trial Days" type="number" fullWidth size="small" value={form.trialDays} onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })} />
              <TextField label="Description" fullWidth size="small" multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddPlan(false)}>Cancel</Button>
            <Button variant="contained" onClick={savePlan}>Save</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default Subscriptions;
