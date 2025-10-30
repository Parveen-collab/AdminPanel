import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
  import Autocomplete from '@mui/material/Autocomplete';
import Layout from '../components/Layout/Layout';
import Loading from '../components/common/Loading';
import { salesAnalyticsApi, ApiFilters } from '../api/salesAnalyticsApi';
import { BarChartComponent } from '../components/Charts/BarChart';
import { PieChartComponent } from '../components/Charts/PieChart';
import { LineChartComponent } from '../components/Charts/LineChart';

const SalesAnalytics: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState<any>(null);
  const [categoryDist, setCategoryDist] = useState<any>(null);
  const [companyDist, setCompanyDist] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [topModels, setTopModels] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Individual filters for each chart
  type FilterMode = 'YEAR' | 'MONTH' | 'CUSTOM';
  const [categoryFilters, setCategoryFilters] = useState<ApiFilters & { mode?: FilterMode }>({ mode: 'YEAR', year: new Date().getFullYear() });
  const [companyFilters, setCompanyFilters] = useState<ApiFilters & { mode?: FilterMode }>({ mode: 'YEAR', year: new Date().getFullYear() });
  const [monthlyFilters, setMonthlyFilters] = useState<ApiFilters>({
    year: new Date().getFullYear(),
  });
  const [topModelsFilters, setTopModelsFilters] = useState<ApiFilters & { mode?: FilterMode}>({
    limit: 10,
    mode: 'YEAR',
    year: new Date().getFullYear(),
  });
  const [paymentFilters, setPaymentFilters] = useState<ApiFilters & { mode?: FilterMode}>({ mode: 'CUSTOM' });

  // Loading states for individual charts
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingTopModels, setLoadingTopModels] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Tabs and view mode per tab
  const [tab, setTab] = useState(0);
  const [categoryView, setCategoryView] = useState<'chart' | 'table'>('table');
  const [companyView, setCompanyView] = useState<'chart' | 'table'>('table');
  const [monthlyView, setMonthlyView] = useState<'chart' | 'table'>('table');
  const [topModelsView, setTopModelsView] = useState<'chart' | 'table'>('table');

  // Basic option lists (can be wired to backend later)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const companyOptions: string[] = [];
  const categoryOptions: string[] = [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load stats (no filters needed)
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const statsData = await salesAnalyticsApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      alert('Error loading stats: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingStats(false);
    }
  };

  // Load category distribution with filters
  const loadCategoryDistribution = async () => {
    setLoadingCategory(true);
    try {
      const catData = await salesAnalyticsApi.getCategoryDistribution(categoryFilters);
      setCategoryDist(catData);
    } catch (error: any) {
      console.error('Error loading category distribution:', error);
      alert('Error loading category distribution: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingCategory(false);
    }
  };

  // Load company distribution with filters
  const loadCompanyDistribution = async () => {
    setLoadingCompany(true);
    try {
      const compData = await salesAnalyticsApi.getCompanyDistribution(companyFilters);
      setCompanyDist(compData);
    } catch (error: any) {
      console.error('Error loading company distribution:', error);
      alert('Error loading company distribution: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingCompany(false);
    }
  };

  // Load monthly sales with filters
  const loadMonthlySales = async () => {
    setLoadingMonthly(true);
    try {
      const monthly = await salesAnalyticsApi.getMonthlySales(monthlyFilters);
      setMonthlyData(monthly);
    } catch (error: any) {
      console.error('Error loading monthly sales:', error);
      alert('Error loading monthly sales: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Load top models with filters
  const loadTopModels = async () => {
    setLoadingTopModels(true);
    try {
      const models = await salesAnalyticsApi.getTopModels(topModelsFilters);
      setTopModels(models);
    } catch (error: any) {
      console.error('Error loading top models:', error);
      alert('Error loading top models: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingTopModels(false);
    }
  };

  // Load payment stats with filters
  const loadPaymentStats = async () => {
    setLoadingPayment(true);
    try {
      const payment = await salesAnalyticsApi.getPaymentStats(paymentFilters);
      setPaymentStats(payment);
    } catch (error: any) {
      console.error('Error loading payment stats:', error);
      alert('Error loading payment stats: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingPayment(false);
    }
  };

  // Load stats on mount, and load all charts with sensible defaults
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          loadStats(),
          loadMonthlySales(),
          loadCategoryDistribution(),
          loadCompanyDistribution(),
          loadTopModels(),
          loadPaymentStats(),
        ]);
        setGlobalError(null);
      } catch (e: any) {
        setGlobalError(e?.response?.data?.message || e?.message || 'Failed to load analytics');
      }
    };
    bootstrap();
  }, []);

  // Refresh handler that reloads current tab (and stats)
  const refreshCurrent = async () => {
    try {
      loadStats();
      if (tab === 0) await loadMonthlySales();
      if (tab === 1) await loadTopModels();
      if (tab === 2) await loadCategoryDistribution();
      if (tab === 3) await loadCompanyDistribution();
      setGlobalError(null);
    } catch (e: any) {
      setGlobalError(e?.response?.data?.message || e?.message || 'Failed to refresh');
    }
  };

  // Auto call APIs when switching tabs
  useEffect(() => {
    refreshCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Debounced auto call on filter changes per section
  useEffect(() => {
    const id = setTimeout(() => loadCategoryDistribution(), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilters]);

  useEffect(() => {
    const id = setTimeout(() => loadCompanyDistribution(), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilters]);

  useEffect(() => {
    const id = setTimeout(() => loadMonthlySales(), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyFilters]);

  useEffect(() => {
    const id = setTimeout(() => loadTopModels(), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topModelsFilters]);

  useEffect(() => {
    const id = setTimeout(() => loadPaymentStats(), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilters]);

  // Unified filter controls per spec: Mode -> Year/Month/Custom
  const FilterControls = ({
    filters,
    setFilters,
    onApply,
    onReset,
    includeLimit,
  }: {
    filters: (ApiFilters & { mode?: FilterMode, limit?: number });
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    onApply: () => void;
    onReset: () => void;
    includeLimit?: boolean;
  }) => {
    const mode: FilterMode = (filters.mode as FilterMode) || 'YEAR';
    const handleMode = (m: FilterMode) => {
      setFilters((prev: any) => ({ ...prev, mode: m }));
    };
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Filter Type" size="small" value={mode}
              onChange={(e) => handleMode(e.target.value as FilterMode)}>
              <MenuItem value="YEAR">Year</MenuItem>
              <MenuItem value="MONTH">Month</MenuItem>
              <MenuItem value="CUSTOM">Custom Date</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={companyOptions}
              value={(filters as any).company || null}
              onChange={(_, v) => setFilters((p: any) => ({ ...p, company: v || undefined }))}
              renderInput={(params) => (
                <TextField {...params} label="Select Company" size="small" placeholder="All" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={categoryOptions}
              value={(filters as any).category || null}
              onChange={(_, v) => setFilters((p: any) => ({ ...p, category: v || undefined }))}
              renderInput={(params) => (
                <TextField {...params} label="Select Category" size="small" placeholder="All" />
              )}
            />
          </Grid>
          {mode === 'YEAR' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Select Year" size="small"
                value={filters.year || ''}
                onChange={(e) => setFilters((p: any) => ({ ...p, year: e.target.value ? parseInt(e.target.value) : undefined }))}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          {mode === 'MONTH' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Select Year" size="small"
                  value={filters.year || ''}
                  onChange={(e) => setFilters((p: any) => ({ ...p, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Month" size="small"
                  value={filters.month || ''}
                  onChange={(e) => setFilters((p: any) => ({ ...p, month: e.target.value ? parseInt(e.target.value) : undefined }))}
                >
                  <MenuItem value={1}>January</MenuItem>
                  <MenuItem value={2}>February</MenuItem>
                  <MenuItem value={3}>March</MenuItem>
                  <MenuItem value={4}>April</MenuItem>
                  <MenuItem value={5}>May</MenuItem>
                  <MenuItem value={6}>June</MenuItem>
                  <MenuItem value={7}>July</MenuItem>
                  <MenuItem value={8}>August</MenuItem>
                  <MenuItem value={9}>September</MenuItem>
                  <MenuItem value={10}>October</MenuItem>
                  <MenuItem value={11}>November</MenuItem>
                  <MenuItem value={12}>December</MenuItem>
                </TextField>
              </Grid>
            </>
          )}
          {mode === 'CUSTOM' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Start Date" type="date" size="small"
                  InputLabelProps={{ shrink: true }} value={filters.startDate || ''}
                  onChange={(e) => setFilters((p: any) => ({ ...p, startDate: e.target.value || undefined }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="End Date" type="date" size="small"
                  InputLabelProps={{ shrink: true }} value={filters.endDate || ''}
                  onChange={(e) => setFilters((p: any) => ({ ...p, endDate: e.target.value || undefined }))}
                />
              </Grid>
            </>
          )}
          {includeLimit && (
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth label="Limit" type="number" size="small"
                inputProps={{ min:1 }} value={filters.limit || 10}
                onChange={(e) => setFilters((p: any) => ({ ...p, limit: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={2}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onApply} size="small" fullWidth>Apply</Button>
              <Button variant="outlined" onClick={onReset} size="small" fullWidth>Reset</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loadingStats && !stats) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Sales Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Comprehensive sales analytics and insights
        </Typography>
        {globalError && (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, border: '1px solid', borderColor: 'error.light', bgcolor: 'error.lighter' as any }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography color="error">{globalError}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => refreshCurrent()}>Retry</Button>
                  <Button size="small" onClick={() => setGlobalError(null)}>Dismiss</Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Auto refresh removed; APIs fire on tab switch and filter changes */}

        {/* 1. Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Sales (All Time)
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats?.totalSalesOfProducts !== undefined ? formatCurrency(stats.totalSalesOfProducts) : (loadingStats ? 'Loading...' : '₹0')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This Month Sales
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats?.thisMonthTotalSales !== undefined ? formatCurrency(stats.thisMonthTotalSales) : (loadingStats ? 'Loading...' : '₹0')}
              </Typography>
              {stats?.increaseOrDecreasePercentage !== null && stats?.increaseOrDecreasePercentage !== undefined && (
                <Chip
                  label={`${stats.increaseOrDecreasePercentage > 0 ? '+' : ''}${stats.increaseOrDecreasePercentage.toFixed(2)}%`}
                  color={stats.increaseOrDecreasePercentage > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Month Sales
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats?.lastMonthTotalSales !== undefined ? formatCurrency(stats.lastMonthTotalSales) : (loadingStats ? 'Loading...' : '₹0')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Today Sales
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {stats?.todayTotalSales !== undefined ? formatCurrency(stats.todayTotalSales) : (loadingStats ? 'Loading...' : '₹0')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs for analytics sections */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Monthly" />
            <Tab label="Top Selling Models" />
            <Tab label="Category-wise Distribution" />
            <Tab label="Company-wise Distribution" />
          </Tabs>

          {/* Monthly */}
          {tab === 0 && (
            <Box sx={{ mt: 2 }}>
              <FilterControls
                filters={{ ...monthlyFilters, mode: 'YEAR' as FilterMode }}
                setFilters={setMonthlyFilters}
                onApply={loadMonthlySales}
                onReset={() => { setMonthlyFilters({ year: new Date().getFullYear() }); setTimeout(loadMonthlySales, 100); }}
              />
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                <ToggleButtonGroup value={monthlyView} exclusive size="small" onChange={(_, v) => v && setMonthlyView(v)}>
                  <ToggleButton value="chart">Chart</ToggleButton>
                  <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {loadingMonthly ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography>Loading...</Typography></Box>
              ) : monthlyData?.monthlyData && monthlyData.monthlyData.length > 0 ? (
                monthlyView === 'chart' ? (
                  <LineChartComponent
                    data={monthlyData.monthlyData.map((item: any) => ({
                      name: item.month || 'Unknown',
                      sales: item.totalAmount || 0,
                      quantity: item.totalQuantity || 0,
                    }))}
                    dataKey="sales"
                  />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Total Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlyData.monthlyData.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.month || 'Unknown'}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalAmount || 0)}</TableCell>
                            <TableCell align="right">{item.totalQuantity || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No monthly data available. Apply filters to load data.
                </Typography>
              )}
            </Box>
          )}

          {/* Top Models */}
          {tab === 1 && (
            <Box sx={{ mt: 2 }}>
              <FilterControls
                filters={topModelsFilters}
                setFilters={setTopModelsFilters}
                onApply={loadTopModels}
                onReset={() => { setTopModelsFilters({ limit: 10, mode: 'YEAR', year: new Date().getFullYear() }); setTimeout(loadTopModels, 100); }}
                includeLimit
              />
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                <ToggleButtonGroup value={topModelsView} exclusive size="small" onChange={(_, v) => v && setTopModelsView(v)}>
                  <ToggleButton value="table">Table</ToggleButton>
                  <ToggleButton value="chart">Chart</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {loadingTopModels ? (
                <Box sx={{ textAlign: 'center', py: 2 }}><Typography>Loading...</Typography></Box>
              ) : topModels?.topModels && topModels.topModels.length > 0 ? (
                topModelsView === 'table' ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topModels.topModels.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.model || 'N/A'}</TableCell>
                            <TableCell>{item.company || 'N/A'}</TableCell>
                            <TableCell>{item.category || 'N/A'}</TableCell>
                            <TableCell align="right">{item.totalQuantity || 0}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalAmount || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <PieChartComponent
                    data={topModels.topModels.map((item: any) => ({ name: item.model || 'N/A', value: item.totalAmount || 0 }))}
                  />
                )
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No top models data available
                </Typography>
              )}
            </Box>
          )}

          {/* Category-wise */}
          {tab === 2 && (
            <Box sx={{ mt: 2 }}>
              <FilterControls
                filters={categoryFilters}
                setFilters={setCategoryFilters}
                onApply={loadCategoryDistribution}
                onReset={() => { setCategoryFilters({ mode: 'YEAR', year: new Date().getFullYear() }); setTimeout(loadCategoryDistribution, 100); }}
              />
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                <ToggleButtonGroup value={categoryView} exclusive size="small" onChange={(_, v) => v && setCategoryView(v)}>
                  <ToggleButton value="chart">Chart</ToggleButton>
                  <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {loadingCategory ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography>Loading...</Typography></Box>
              ) : categoryDist?.categorySales && categoryDist.categorySales.length > 0 ? (
                categoryView === 'chart' ? (
                  <PieChartComponent
                    data={categoryDist.categorySales.map((item: any) => ({ name: item.category || 'Unknown', value: item.totalAmount || 0 }))}
                  />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryDist.categorySales.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.category || 'Unknown'}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalAmount || 0)}</TableCell>
                            <TableCell align="right">{item.totalQuantity || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No category data available. Apply filters to load data.
                </Typography>
              )}
            </Box>
          )}

          {/* Company-wise */}
          {tab === 3 && (
            <Box sx={{ mt: 2 }}>
              <FilterControls
                filters={companyFilters}
                setFilters={setCompanyFilters}
                onApply={loadCompanyDistribution}
                onReset={() => { setCompanyFilters({ mode: 'YEAR', year: new Date().getFullYear() }); setTimeout(loadCompanyDistribution, 100); }}
              />
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                <ToggleButtonGroup value={companyView} exclusive size="small" onChange={(_, v) => v && setCompanyView(v)}>
                  <ToggleButton value="chart">Chart</ToggleButton>
                  <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {loadingCompany ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography>Loading...</Typography></Box>
              ) : companyDist?.companySales && companyDist.companySales.length > 0 ? (
                companyView === 'chart' ? (
                  <PieChartComponent
                    data={companyDist.companySales.map((item: any) => ({ name: item.company || 'Unknown', value: item.totalAmount || 0 }))}
                  />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companyDist.companySales.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.company || 'Unknown'}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalAmount || 0)}</TableCell>
                            <TableCell align="right">{item.totalQuantity || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No company data available. Apply filters to load data.
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* 6. Payment Mode Statistics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Payment Mode Statistics (Cash, Dues, EMI)
          </Typography>
          <FilterControls
            filters={paymentFilters}
            setFilters={setPaymentFilters}
            onApply={loadPaymentStats}
            onReset={() => { setPaymentFilters({ mode: 'CUSTOM' }); setTimeout(loadPaymentStats, 100); }}
          />
          {loadingPayment ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Cash Sales
                  </Typography>
                  <Typography variant="h5">
                    {paymentStats?.totalCashAmount !== undefined ? formatCurrency(paymentStats.totalCashAmount) : (loadingPayment ? 'Loading...' : '₹0')}
                  </Typography>
                  <Typography variant="caption">
                    {paymentStats?.totalCashCount || 0} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Dues
                  </Typography>
                  <Typography variant="h5">
                    {paymentStats?.totalDuesAmount !== undefined ? formatCurrency(paymentStats.totalDuesAmount) : (loadingPayment ? 'Loading...' : '₹0')}
                  </Typography>
                  <Typography variant="caption">
                    {paymentStats?.totalDuesCount || 0} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    EMI
                  </Typography>
                  <Typography variant="h5">
                    {paymentStats?.totalEmiAmount !== undefined ? formatCurrency(paymentStats.totalEmiAmount) : (loadingPayment ? 'Loading...' : '₹0')}
                  </Typography>
                  <Typography variant="caption">
                    {paymentStats?.totalEmiCount || 0} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Grand Total: {paymentStats?.grandTotal !== undefined ? formatCurrency(paymentStats.grandTotal) : '₹0'} (
                {paymentStats?.grandTotalCount || 0} transactions)
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default SalesAnalytics;

