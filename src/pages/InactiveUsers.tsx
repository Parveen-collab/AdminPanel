import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Divider,
  Alert,
} from '@mui/material';
import Layout from '../components/Layout/Layout';
import Loading from '../components/common/Loading';
import { userActivityApi } from '../api/userActivityApi';
import { PieChartComponent } from '../components/Charts/PieChart';
import { LineChartComponent } from '../components/Charts/LineChart';

interface ActivityRow {
  userId: number;
  email: string;
  shopId?: string;
  shopStoreName?: string;
  lastActivityTime: string | null;
  lastLoginTime: string | null;
  minutesSinceLastActivity: number; // -1 if never
}

type Unit = 'hours' | 'days';

const InactiveUsers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [threshold, setThreshold] = useState<number>(48); // default 2 days
  const [unit, setUnit] = useState<Unit>('hours');

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('[InactiveUsers] Loading all statuses...');
    setLoading(true);
    setError(null);
    try {
      const list = await userActivityApi.getAllStatuses();
      console.log('[InactiveUsers] API result size:', Array.isArray(list) ? list.length : list);
      const mapped: ActivityRow[] = (list || []).map((u: any) => ({
        userId: u.userId,
        email: u.email,
        shopId: u.shopId,
        shopStoreName: u.shopStoreName,
        lastActivityTime: u.lastActivityTime || null,
        lastLoginTime: u.lastLoginTime || null,
        minutesSinceLastActivity: typeof u.minutesSinceLastActivity === 'number' ? u.minutesSinceLastActivity : -1,
      }));
      setData(mapped);
    } catch (e: any) {
      console.error('[InactiveUsers] Failed to load activity statuses', e);
      const msg = e.response?.data?.message || e.message || 'Failed to load activity statuses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const thresholdInMinutes = useMemo(() => {
    return unit === 'hours' ? threshold : threshold * 24 * 60;
  }, [threshold, unit]);

  const filteredInactive = useMemo(() => {
    return data.filter((row) => {
      if (row.minutesSinceLastActivity === -1) return true; // never active -> always inactive
      return row.minutesSinceLastActivity >= thresholdInMinutes;
    });
  }, [data, thresholdInMinutes]);

  const activeCount = data.length - filteredInactive.length;
  const inactiveCount = filteredInactive.length;
  const ratioData = useMemo(() => (
    [
      { name: 'Inactive', value: inactiveCount },
      { name: 'Active', value: activeCount },
    ]
  ), [inactiveCount, activeCount]);

  // Trend over last 14 days: number of inactive users at each day boundary (computed from lastActivityTime)
  const trendData = useMemo(() => {
    const points: { name: string; inactive: number }[] = [];
    for (let d = 14; d >= 0; d--) {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - d);
      // count users whose lastActivityTime is before thresholdDate
      const count = data.filter((row) => {
        if (!row.lastActivityTime) return true; // never -> inactive
        const last = new Date(row.lastActivityTime);
        return last < thresholdDate;
      }).length;
      const label = thresholdDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      points.push({ name: label, inactive: count });
    }
    return points;
  }, [data]);

  const handlePreset = (days: number) => {
    setUnit('days');
    setThreshold(days);
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>Inactive Users</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Users who have not used the software for a chosen time threshold. Analyze ratios and trends.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="Threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value || '0'))}
                inputProps={{ min: 1 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                select
                fullWidth
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                size="small"
              >
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => handlePreset(2)}>2 Days</Button>
                <Button variant="outlined" onClick={() => handlePreset(7)}>7 Days</Button>
                <Button variant="text" onClick={loadData}>Refresh</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
              <Typography variant="h5" fontWeight={700}>{data.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Inactive (Filtered)</Typography>
              <Typography variant="h5" fontWeight={700}>{inactiveCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h5" fontWeight={700}>{activeCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Inactive %</Typography>
              <Typography variant="h5" fontWeight={700}>
                {data.length ? ((inactiveCount / data.length) * 100).toFixed(1) : '0.0'}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Inactive vs Active Ratio</Typography>
              <PieChartComponent data={ratioData} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Inactive Users Trend (Last 14 Days)</Typography>
              <LineChartComponent data={trendData} dataKey="inactive" />
            </Paper>
          </Grid>
        </Grid>

        {/* Table */}
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Inactive Users List</Typography>
            <Typography variant="caption" color="text.secondary">
              Showing users inactive for at least the selected threshold
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Shop ID</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Minutes Since</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInactive.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.userId}>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.shopStoreName || '-'}</TableCell>
                    <TableCell>{row.shopId || '-'}</TableCell>
                    <TableCell>{row.lastActivityTime ? new Date(row.lastActivityTime).toLocaleString('en-IN') : 'Never'}</TableCell>
                    <TableCell>{row.minutesSinceLastActivity === -1 ? 'Never' : row.minutesSinceLastActivity}</TableCell>
                  </TableRow>
                ))}
                {filteredInactive.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No inactive users for the selected threshold
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredInactive.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>
      </Box>
    </Layout>
  );
};

export default InactiveUsers;
