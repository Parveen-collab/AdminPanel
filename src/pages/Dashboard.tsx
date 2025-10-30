import React from 'react';
import { Grid, Paper, Stack, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import Layout from '../components/Layout/Layout';
import { adminUserApi } from '../api/adminUserApi';
import { LineChartComponent } from '../components/Charts/LineChart';
import { BarChartComponent } from '../components/Charts/BarChart';
import { PieChartComponent } from '../components/Charts/PieChart';
import Loading from '../components/common/Loading';

const StatCard: React.FC<{ title: string; value: string | number; loading?: boolean }> = ({ 
  title, 
  value, 
  loading = false 
}) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h5" fontWeight={700}>
      {loading ? '...' : value}
    </Typography>
  </Paper>
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = React.useState<any>(null);
  const [monthly, setMonthly] = React.useState<any[]>([]);
  const [stateDist, setStateDist] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, m, state] = await Promise.all([
        adminUserApi.getStatistics(),
        adminUserApi.getMonthlyCharts({}),
        adminUserApi.getStateDistribution(),
      ]);
      setStats(s.payload);
      
      const chart = (m.payload || []).map((it: any) => ({ 
        name: it.monthName, 
        users: it.userCount 
      }));
      setMonthly(chart);
      
      const stateChart = (state.payload || []).slice(0, 6).map((it: any) => ({
        name: it.name,
        value: it.count,
        percentage: it.percentage
      }));
      setStateDist(stateChart);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatCard title="Total Users" value={stats?.totalUsers ?? '-'} loading={loading} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard title="This Month" value={stats?.thisMonthRegistrations ?? '-'} loading={loading} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard title="Last Month" value={stats?.lastMonthRegistrations ?? '-'} loading={loading} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard title="Growth %" value={(stats?.growthPercentage ?? 0).toFixed(2)} loading={loading} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Registrations
              </Typography>
              {loading ? (
                <Loading message="Loading chart data..." />
              ) : (
                <LineChartComponent data={monthly} />
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top States
              </Typography>
              {loading ? (
                <Loading message="Loading distribution..." />
              ) : (
                <PieChartComponent data={stateDist} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Layout>
  );
};

export default Dashboard;
