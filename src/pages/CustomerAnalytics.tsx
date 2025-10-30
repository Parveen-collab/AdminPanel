import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Paper, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, MenuItem
} from '@mui/material';
import { TrendingUp, TrendingDown, People, Repeat, PersonAdd, FilterList } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { customerStatsApi, CustomerStatsSummary, MonthlyCustomerData, TopCustomer, DistributionData } from '../api/customerStatsApi';
import Loading from '../components/common/Loading';
import { LineChartComponent } from '../components/Charts/LineChart';
import { BarChartComponent } from '../components/Charts/BarChart';
import { PieChartComponent } from '../components/Charts/PieChart';

const CustomerAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | 'all'>(new Date().getFullYear());
  const [topLimit, setTopLimit] = useState(10);
  const [stats, setStats] = useState<CustomerStatsSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyCustomerData[]>([]);
  const [topByPurchase, setTopByPurchase] = useState<TopCustomer[]>([]);
  const [topByQuantity, setTopByQuantity] = useState<TopCustomer[]>([]);
  const [villageDist, setVillageDist] = useState<DistributionData[]>([]);

  useEffect(() => {
    loadAllData();
  }, [year, topLimit]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const yearParam = year === 'all' ? undefined : year;
      const [statsRes, monthlyRes, topPurchaseRes, topQtyRes, villageRes] = await Promise.all([
        customerStatsApi.getStatsSummary(yearParam),
        customerStatsApi.getMonthlyData(yearParam),
        customerStatsApi.getTopByPurchase(yearParam, topLimit),
        customerStatsApi.getTopByQuantity(yearParam, topLimit),
        customerStatsApi.getVillageDistribution(yearParam),
      ]);
      
      // Extract payload with error handling - handle both direct payload and nested response
      const getPayload = (res: any) => res?.payload || res?.data?.payload || res?.data;
      
      const statsData = getPayload(statsRes);
      const monthlyDataArr = getPayload(monthlyRes);
      const topPurchaseArr = getPayload(topPurchaseRes);
      const topQtyArr = getPayload(topQtyRes);
      const villageArr = getPayload(villageRes);
      
      if (statsData) {
        setStats(statsData);
      }
      if (monthlyDataArr) {
        setMonthlyData(Array.isArray(monthlyDataArr) ? monthlyDataArr : []);
      }
      if (topPurchaseArr) {
        setTopByPurchase(Array.isArray(topPurchaseArr) ? topPurchaseArr : []);
      }
      if (topQtyArr) {
        setTopByQuantity(Array.isArray(topQtyArr) ? topQtyArr : []);
      }
      if (villageArr) {
        setVillageDist(Array.isArray(villageArr) ? villageArr : []);
      }
    } catch (err) {
      console.error('Failed to load customer stats', err);
      // Set empty states on error
      setStats(null);
      setMonthlyData([]);
      setTopByPurchase([]);
      setTopByQuantity([]);
      setVillageDist([]);
    } finally {
      setLoading(false);
    }
  };

  const monthlyChartData = monthlyData
    .filter(m => m && m.monthName) // Filter out invalid entries
    .map(m => ({
      name: m.monthName || `Month ${m.month}`,
      new: m.newCustomers || 0,
      repeat: m.repeatCustomers || 0,
      total: m.totalCustomers || 0,
    }));

  const villageChartData = villageDist
    .filter(v => v && (v.village || v.village === null)) // Filter out invalid entries
    .map(v => ({
      name: v.village || 'Unknown',
      value: v.count || 0,
      percentage: 0,
    }))
    .map(v => {
      const total = villageDist.reduce((sum, d) => sum + (d.count || 0), 0);
      return {
        ...v,
        percentage: total > 0 ? (v.value / total) * 100 : 0
      };
    });

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>Customer Analytics</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Year"
              size="small"
              value={year}
              onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 120 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">All Time</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </TextField>
            <TextField
              label="Top N"
              type="number"
              size="small"
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              sx={{ width: 100 }}
              inputProps={{ min: 1, max: 100 }}
            />
            <Button variant="outlined" startIcon={<FilterList />} onClick={loadAllData}>Refresh</Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <People color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Total Customers {year !== 'all' && `(${year})`}
                  </Typography>
                </Stack>
                <Typography variant="h4">{loading ? '...' : (stats?.totalCustomers || 0).toLocaleString()}</Typography>
                {year === 'all' && (
                  <Typography variant="caption" color="text.secondary">All Time Database</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Repeat color="secondary" />
                  <Typography variant="caption" color="text.secondary">Repeat Customers</Typography>
                </Stack>
                <Typography variant="h4">{loading ? '...' : (stats?.totalRepeatCustomers || 0).toLocaleString()}</Typography>
                {year === 'all' && (
                  <Typography variant="caption" color="text.secondary">All Time</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <PersonAdd color="success" />
                  <Typography variant="caption" color="text.secondary">New Customers</Typography>
                </Stack>
                <Typography variant="h4">{loading ? '...' : (stats?.totalNewCustomers || 0).toLocaleString()}</Typography>
                {year === 'all' && (
                  <Typography variant="caption" color="text.secondary">All Time</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  {stats && stats.growthPercentage >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                  <Typography variant="caption" color="text.secondary">
                    {year === 'all' ? 'Total Growth' : 'Growth %'}
                  </Typography>
                </Stack>
                {year === 'all' ? (
                  <>
                    <Typography variant="h4" color="success.main">
                      {loading ? '...' : (stats?.increment || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Customers</Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h4" color={stats && stats.growthPercentage >= 0 ? 'success.main' : 'error.main'}>
                      {loading ? '...' : `${(stats?.growthPercentage || 0).toFixed(1)}%`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.increment || 0} ↑ / {stats?.decrement || 0} ↓
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            Monthly Customer Trends {year !== 'all' && `(${year})`}
          </Typography>
          {loading ? <Loading /> : monthlyChartData.length > 0 ? (
            <LineChartComponent 
              data={monthlyChartData.map(m => ({ name: m.name, users: m.total }))}
              dataKey="users"
              firstLabel="Total Customers"
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No monthly data available
            </Box>
          )}
        </Paper>

        {/* Charts Row */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>New vs Repeat Customers</Typography>
              {loading ? <Loading /> : monthlyChartData.length > 0 ? (
                <BarChartComponent
                  data={monthlyChartData.map(m => ({
                    name: m.name,
                    new: m.new,
                    repeat: m.repeat
                  }))}
                  dataKey="name"
                />
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No data available
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>Village Distribution</Typography>
              {loading ? <Loading /> : villageChartData.length > 0 ? (
                <PieChartComponent data={villageChartData.slice(0, 10)} />
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No village distribution data available
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Top Customers Tables */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={700}>Top {topLimit} Customers by Purchase</Typography>
              {loading ? <Loading /> : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Village</TableCell>
                      <TableCell align="right">Purchase</TableCell>
                      <TableCell align="right">Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topByPurchase.map((c, idx) => (
                      <TableRow key={c.customerId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>{c.village}</TableCell>
                        <TableCell align="right">₹{c.totalPurchase.toLocaleString()}</TableCell>
                        <TableCell align="right">{c.totalQuantity}</TableCell>
                      </TableRow>
                    ))}
                    {topByPurchase.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">No data</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={700}>Top {topLimit} Customers by Quantity</Typography>
              {loading ? <Loading /> : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Village</TableCell>
                      <TableCell align="right">Purchase</TableCell>
                      <TableCell align="right">Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topByQuantity.map((c, idx) => (
                      <TableRow key={c.customerId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>{c.village}</TableCell>
                        <TableCell align="right">₹{c.totalPurchase.toLocaleString()}</TableCell>
                        <TableCell align="right">{c.totalQuantity}</TableCell>
                      </TableRow>
                    ))}
                    {topByQuantity.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">No data</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Layout>
  );
};

export default CustomerAnalytics;

