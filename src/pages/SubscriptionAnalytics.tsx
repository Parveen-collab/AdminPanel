import React, { useEffect, useState } from 'react';
import { Grid, Paper, Stack, TextField, Button, Typography } from '@mui/material';
import Layout from '../components/Layout/Layout';
import { subscriptionApi } from '../api/subscriptionApi';
import Loading from '../components/common/Loading';
import { LineChartComponent } from '../components/Charts/LineChart';
import { PieChartComponent } from '../components/Charts/PieChart';

const SubscriptionAnalytics: React.FC = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try { const res = await subscriptionApi.analyticsSummary(start, end); setSummary(res.payload); } finally { setLoading(false); }
  };

  useEffect(() => { const now = new Date(); const s = new Date(now.getFullYear(), 0, 1); setStart(s.toISOString().slice(0,10)); setEnd(now.toISOString().slice(0,10)); }, []);
  useEffect(() => { if (start && end) load(); }, [start, end]);

  const monthlyData = (summary?.monthlyRevenue || []).map((m: any[]) => ({ name: m[0], users: Number(m[1]) }));
  const planDist = (summary?.activeByPlan || []).map((p: any[]) => ({ name: p[0], value: Number(p[1]) }));

  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>Subscription Analytics</Typography>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="Start" type="date" InputLabelProps={{ shrink: true }} value={start} onChange={e => setStart(e.target.value)} />
            <TextField label="End" type="date" InputLabelProps={{ shrink: true }} value={end} onChange={e => setEnd(e.target.value)} />
            <Button variant="contained" onClick={load}>Refresh</Button>
          </Stack>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>{loading ? <Loading /> : <LineChartComponent data={monthlyData} />}</Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>{loading ? <Loading /> : <PieChartComponent data={planDist} />}</Paper>
          </Grid>
        </Grid>
      </Stack>
    </Layout>
  );
};

export default SubscriptionAnalytics;


