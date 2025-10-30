import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Grid, Paper, Stack, TextField, Typography, Chip, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, MenuItem, Select, FormControl,
  InputLabel, Switch, FormControlLabel
} from '@mui/material';
import { Add, Refresh, Delete, Edit, LocalOffer, TrendingUp, CheckCircle, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { promoCodeApi, PromoCode } from '../api/promoCodeApi';
import Loading from '../components/common/Loading';
import { LineChartComponent } from '../components/Charts/LineChart';
import { BarChartComponent } from '../components/Charts/BarChart';
import { format } from 'date-fns';

const PromoCodeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [form, setForm] = useState<PromoCode>({
    code: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicablePlanCodes: '',
    applicableToNewSubscription: true,
    applicableToUpgrade: true,
    isUsed: false,
    currentUses: 0,
    active: true,
  });
  const [usageData, setUsageData] = useState<any[]>([]);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [mostUsed, setMostUsed] = useState<PromoCode[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  useEffect(() => {
    loadMonthlyStats();
  }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await promoCodeApi.getByStatus(selectedFilter === 'used');
      setPromoCodes(res.payload || []);
      await loadStats();
      await loadMostUsed();
    } catch (err) {
      console.error('Failed to load promo codes', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await promoCodeApi.getStats();
      if (res.payload) {
        setStats(res.payload);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const res = await promoCodeApi.getMonthlyStatsByYear(selectedYear);
      if (res.payload) {
        // Format generated data
        const genData = (res.payload.generated || []).map((item: any[]) => ({
          name: item[0] || '',
          value: Number(item[1] || 0)
        }));
        setGeneratedData(genData);
        
        // Format used data
        const usedData = (res.payload.used || []).map((item: any[]) => ({
          name: item[0] || '',
          value: Number(item[1] || 0)
        }));
        setUsageData(usedData);
      }
    } catch (err) {
      console.error('Failed to load monthly stats', err);
    }
  };
  
  // Create merged chart data with both used and generated
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => {
      const usedItem = usageData.find(item => item.name === month);
      const generatedItem = generatedData.find(item => item.name === month);
      return {
        name: month,
        used: usedItem?.value || 0,
        generated: generatedItem?.value || 0
      };
    });
  }, [usageData, generatedData]);

  const loadMostUsed = async () => {
    try {
      const res = await promoCodeApi.getMostUsed(5);
      setMostUsed(res.payload || []);
    } catch (err) {
      console.error('Failed to load most used', err);
    }
  };

  const savePromoCode = async () => {
    try {
      // For generate dialog, always use generate endpoint (code will be auto-generated)
      if (showGenerateDialog) {
        await promoCodeApi.generate(form);
      } else if (form.code && form.code.trim()) {
        // Manual create with code provided
        await promoCodeApi.create(form);
      } else {
        // No code provided in manual create, generate random
        await promoCodeApi.generate(form);
      }
      setShowAddDialog(false);
      setShowGenerateDialog(false);
      setForm({
        code: '',
        description: '',
        discountType: 'FIXED_AMOUNT',
        discountValue: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicablePlanCodes: '',
        applicableToNewSubscription: true,
        applicableToUpgrade: true,
        isUsed: false,
        currentUses: 0,
        active: true,
      });
      loadData();
    } catch (err: any) {
      console.error('Failed to save promo code', err);
      alert(err?.response?.data?.message || 'Failed to save promo code');
    }
  };

  const deletePromoCode = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await promoCodeApi.delete(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete promo code', err);
    }
  };

  const filteredPromoCodes = promoCodes.filter(pc => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'used') return pc.isUsed;
    if (selectedFilter === 'unused') return !pc.isUsed;
    return true;
  });

  const mostUsedData = mostUsed.map(pc => ({
    name: pc.code,
    value: pc.currentUses
  }));

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>Promo Code Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadData}>
              Refresh
            </Button>
          <Button variant="outlined" startIcon={<Add />} onClick={() => {
            setForm({ ...form, code: '' }); // Clear code for manual entry
            setShowAddDialog(true);
          }}>
            Create (Manual)
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setForm({ ...form, code: '' }); // Code will be auto-generated
            setShowGenerateDialog(true);
          }}>
            Generate Random Code
          </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Codes</Typography>
                <Typography variant="h4">{stats.totalCodes || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Used Codes</Typography>
                <Typography variant="h4" color="success.main">{stats.usedCodes || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Unused Codes</Typography>
                <Typography variant="h4" color="primary.main">{stats.unusedCodes || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Discount Given</Typography>
                <Typography variant="h4" color="error.main">₹{(stats.totalDiscountGiven || 0).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Monthly Statistics</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select value={selectedYear} onChange={e => setSelectedYear(e.target.value as number)} label="Year">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {loading ? <Loading /> : (
                <LineChartComponent 
                  data={chartData}
                  dataKey="used"
                  secondDataKey="generated"
                  secondLabel="Generated"
                  firstLabel="Used"
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Most Used Codes</Typography>
              {loading ? <Loading /> : <BarChartComponent data={mostUsedData} valueKey="value" />}
            </Paper>
          </Grid>
        </Grid>

        {/* Filter and List */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value as any)} label="Filter">
                <MenuItem value="all">All Codes</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="unused">Unused</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredPromoCodes.length} promo codes
            </Typography>
          </Box>

          {loading ? <Loading /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Valid Period</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPromoCodes.map((pc) => (
                    <TableRow key={pc.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                          {pc.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={pc.discountType === 'FIXED_AMOUNT' ? 'Fixed' : 'Percentage'} size="small" />
                      </TableCell>
                      <TableCell>
                        {pc.discountType === 'FIXED_AMOUNT' ? `₹${pc.discountValue}` : `${pc.discountValue}%`}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(pc.validFrom), 'dd MMM yyyy')} - {format(new Date(pc.validTo), 'dd MMM yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {pc.currentUses} {pc.maxUses ? `/ ${pc.maxUses}` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={pc.isUsed ? <CheckCircle /> : <Cancel />}
                          label={pc.isUsed ? 'Used' : 'Unused'}
                          color={pc.isUsed ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => deletePromoCode(pc.id!)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPromoCodes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">No promo codes found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Code" fullWidth size="small" value={form.code} 
                onChange={e => setForm({ ...form, code: e.target.value })} required />
              <TextField label="Description" fullWidth size="small" multiline rows={2} value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} />
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} label="Discount Type">
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                </Select>
              </FormControl>
              <TextField label={form.discountType === 'FIXED_AMOUNT' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'} 
                type="number" fullWidth size="small" value={form.discountValue} 
                onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} required />
              <TextField label="Valid From" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} 
                value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} required />
              <TextField label="Valid To" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} 
                value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} required />
              <TextField label="Applicable Plan Codes (comma separated)" fullWidth size="small" 
                value={form.applicablePlanCodes} placeholder="BASIC,PREMIUM (leave empty for all)"
                onChange={e => setForm({ ...form, applicablePlanCodes: e.target.value })} />
              <TextField label="Minimum Purchase Amount" type="number" fullWidth size="small" 
                value={form.minPurchaseAmount || ''} 
                onChange={e => setForm({ ...form, minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined })} />
              <TextField 
                label="Max Uses" 
                type="number" 
                fullWidth 
                size="small" 
                helperText="Leave empty for single-use (1 time). Enter number for multi-use (e.g., 10 = can be used 10 times)."
                value={form.maxUses || ''} 
                onChange={e => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : undefined })} 
              />
              <FormControlLabel control={<Switch checked={form.applicableToNewSubscription} 
                onChange={e => setForm({ ...form, applicableToNewSubscription: e.target.checked })} />} 
                label="Applicable to New Subscriptions" />
              <FormControlLabel control={<Switch checked={form.applicableToUpgrade} 
                onChange={e => setForm({ ...form, applicableToUpgrade: e.target.checked })} />} 
                label="Applicable to Upgrades" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={savePromoCode}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Generate Random Dialog */}
        <Dialog open={showGenerateDialog} onClose={() => setShowGenerateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate Random Promo Code</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Code will be auto-generated randomly. Fill other fields as needed.
              </Typography>
              <TextField label="Description" fullWidth size="small" multiline rows={2} value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} />
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} label="Discount Type">
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                </Select>
              </FormControl>
              <TextField label={form.discountType === 'FIXED_AMOUNT' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'} 
                type="number" fullWidth size="small" value={form.discountValue} 
                onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} required />
              <TextField label="Valid From" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} 
                value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} required />
              <TextField label="Valid To" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} 
                value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} required />
              <TextField 
                label="Max Uses" 
                type="number" 
                fullWidth 
                size="small" 
                helperText="Leave empty for single-use (1 time). Enter number for multi-use (e.g., 10 = can be used 10 times)."
                value={form.maxUses || ''} 
                onChange={e => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : undefined })} 
              />
              <TextField label="Applicable Plan Codes (comma separated)" fullWidth size="small" 
                value={form.applicablePlanCodes || ''} placeholder="BASIC,PREMIUM (leave empty for all)"
                onChange={e => setForm({ ...form, applicablePlanCodes: e.target.value })} />
              <TextField label="Minimum Purchase Amount (₹)" type="number" fullWidth size="small" 
                value={form.minPurchaseAmount || ''} 
                onChange={e => setForm({ ...form, minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined })} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={savePromoCode}>Generate</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default PromoCodeManagement;

