import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Grid, Paper, Stack, TextField, Typography, Chip, Card, CardContent,
  Checkbox, InputAdornment, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Divider
} from '@mui/material';
import { ArrowBack, Search as SearchIcon, Clear as ClearIcon, ExpandMore } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { subscriptionApi, SubscriptionPlan } from '../api/subscriptionApi';
import Loading from '../components/common/Loading';
import { format } from 'date-fns';

interface PlanEndpoint {
  id: number;
  planCode: string;
  httpMethod: string;
  pathPattern: string;
}

const ManagePlanEndpoints: React.FC = () => {
  const { planCode } = useParams<{ planCode: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [allEndpoints, setAllEndpoints] = useState<PlanEndpoint[]>([]);
  const [selectedPlanEndpoints, setSelectedPlanEndpoints] = useState<Set<number>>(new Set());
  const [endpointSearch, setEndpointSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (planCode) {
      loadData();
    }
  }, [planCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, endpointsRes] = await Promise.all([
        subscriptionApi.listPlans(),
        subscriptionApi.listAdminEndpoints(),
      ]);
      const plans = plansRes.payload || [];
      const foundPlan = plans.find((p: SubscriptionPlan) => p.code === planCode);
      
      // For TRIAL plan, create a placeholder if not found in plans list
      if (planCode === 'TRIAL' && !foundPlan) {
        const trialPlaceholder: SubscriptionPlan = {
          code: 'TRIAL',
          name: 'Default Trial Plan',
          description: 'Auto-created lifetime trial subscription for new users',
          priceMonthly: 0,
          priceYearly: 0,
          trialDays: 36500, // 100 years (lifetime)
          active: true,
        };
        setPlan(trialPlaceholder);
      } else {
        setPlan(foundPlan || null);
      }
      
      let endpoints = endpointsRes.payload || [];
      // Auto-discover/import if catalog empty
      if (!endpoints.length) {
        try {
          const discovered = await subscriptionApi.discoverEndpoints();
          const discoveredList = discovered.payload || discovered || [];
          if (Array.isArray(discoveredList) && discoveredList.length) {
            await subscriptionApi.importAdminEndpoints(discoveredList);
            const refreshed = await subscriptionApi.listAdminEndpoints();
            endpoints = refreshed.payload || [];
          }
        } catch (e) {
          console.error('Auto-import failed', e);
        }
      }
      setAllEndpoints(endpoints);
      
      if (planCode) {
        // Load plan endpoints after allEndpoints is set
        const res = await subscriptionApi.listPlanEndpoints(planCode);
        const assigned = res.payload || [];
        const assignedIds = new Set<number>();
        // Match by httpMethod and pathPattern (since plan endpoints might have different IDs)
        endpoints.forEach((ep: PlanEndpoint) => {
          const found = assigned.find((a: PlanEndpoint) => 
            a.httpMethod === ep.httpMethod && a.pathPattern === ep.pathPattern
          );
          if (found) assignedIds.add(ep.id);
        });
        setSelectedPlanEndpoints(assignedIds);
        console.log(`Loaded ${assigned.length} endpoints for plan ${planCode}, matched ${assignedIds.size} with catalog`);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanEndpoints = async (planCode: string) => {
    try {
      const res = await subscriptionApi.listPlanEndpoints(planCode);
      const assigned = res.payload || [];
      const assignedIds = new Set<number>();
      allEndpoints.forEach(ep => {
        const found = assigned.find((a: PlanEndpoint) => a.httpMethod === ep.httpMethod && a.pathPattern === ep.pathPattern);
        if (found) assignedIds.add(ep.id);
      });
      setSelectedPlanEndpoints(assignedIds);
    } catch (err) {
      console.error('Failed to load plan endpoints', err);
    }
  };

  const categorize = (path: string): string => {
    if (!path) return 'Other';
    const p = path.toLowerCase();
    // Inventory category
    if (p.startsWith('/inventory') || p.startsWith('/api/inventory') || 
        p.startsWith('/api/stock') || p.startsWith('/api/mobile') ||
        p.includes('/inventory')) return 'Inventory';
    // Customer category
    if (p.startsWith('/api/customers') || p.startsWith('/api/customer')) return 'Customers';
    // Sale category
    if (p.startsWith('/api/sales') || p.startsWith('/api/sale')) return 'Sales';
    // Purchase/Bill category
    if (p.startsWith('/api/bill') || p.startsWith('/api/purchase')) return 'Purchase/Bill';
    // Account/Ledger category
    if (p.startsWith('/api/ledger') || p.startsWith('/api/account') || 
        p.includes('/ledger') || p.includes('/account')) return 'Account/Ledger';
    // Other categories
    if (p.startsWith('/api/dues') || p.includes('/due')) return 'Dues';
    if (p.startsWith('/api/subscriptions')) return 'Subscriptions';
    if (p.startsWith('/api/users') || p.startsWith('/api/user')) return 'Users/Admin';
    if (p.startsWith('/api/auth') || p.includes('login') || p.includes('token')) return 'Auth';
    if (p.startsWith('/api/hsn')) return 'HSN';
    if (p.startsWith('/api/settings') || p.includes('shop-settings')) return 'Settings';
    if (p.startsWith('/api/festival')) return 'Festival';
    return 'Other';
  };

  // Group endpoints by category
  const groupedEndpoints = React.useMemo(() => {
    const groups: { [key: string]: PlanEndpoint[] } = {};
    allEndpoints.forEach(ep => {
      const category = categorize(ep.pathPattern);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ep);
    });
    // Sort categories: Priority first, then alphabetical
    const priorityOrder = ['Inventory', 'Customers', 'Sales', 'Purchase/Bill', 'Account/Ledger'];
    const sortedCategories = [
      ...priorityOrder.filter(cat => groups[cat]),
      ...Object.keys(groups).filter(cat => !priorityOrder.includes(cat)).sort()
    ];
    const sortedGroups: { [key: string]: PlanEndpoint[] } = {};
    sortedCategories.forEach(cat => {
      sortedGroups[cat] = groups[cat].sort((a, b) => {
        // Sort by method first, then path
        const methodOrder: { [key: string]: number } = { 'GET': 1, 'POST': 2, 'PUT': 3, 'DELETE': 4, 'PATCH': 5 };
        const methodDiff = (methodOrder[a.httpMethod] || 99) - (methodOrder[b.httpMethod] || 99);
        if (methodDiff !== 0) return methodDiff;
        return a.pathPattern.localeCompare(b.pathPattern);
      });
    });
    return sortedGroups;
  }, [allEndpoints]);

  // Filter grouped endpoints by search
  const filteredGroupedEndpoints = React.useMemo(() => {
    const q = endpointSearch.trim().toLowerCase();
    if (!q) return groupedEndpoints;
    
    const filtered: { [key: string]: PlanEndpoint[] } = {};
    Object.keys(groupedEndpoints).forEach(category => {
      const filteredList = groupedEndpoints[category].filter(ep => 
        ep.pathPattern.toLowerCase().includes(q) || 
        ep.httpMethod.toLowerCase().includes(q)
      );
      if (filteredList.length > 0) {
        filtered[category] = filteredList;
      }
    });
    return filtered;
  }, [groupedEndpoints, endpointSearch]);

  // Check if all endpoints in a category are selected
  const isCategoryFullySelected = (category: string): boolean => {
    const categoryEndpoints = filteredGroupedEndpoints[category] || [];
    if (categoryEndpoints.length === 0) return false;
    return categoryEndpoints.every(ep => selectedPlanEndpoints.has(ep.id));
  };

  // Check if some endpoints in a category are selected
  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryEndpoints = filteredGroupedEndpoints[category] || [];
    if (categoryEndpoints.length === 0) return false;
    const selectedCount = categoryEndpoints.filter(ep => selectedPlanEndpoints.has(ep.id)).length;
    return selectedCount > 0 && selectedCount < categoryEndpoints.length;
  };

  // Toggle all endpoints in a category
  const handleCategoryToggle = (category: string) => {
    const categoryEndpoints = filteredGroupedEndpoints[category] || [];
    const newSet = new Set(selectedPlanEndpoints);
    const allSelected = isCategoryFullySelected(category);
    
    if (allSelected) {
      // Deselect all in category
      categoryEndpoints.forEach(ep => newSet.delete(ep.id));
    } else {
      // Select all in category
      categoryEndpoints.forEach(ep => newSet.add(ep.id));
    }
    setSelectedPlanEndpoints(newSet);
  };


  const handleEndpointToggle = (endpointId: number) => {
    const newSet = new Set(selectedPlanEndpoints);
    if (newSet.has(endpointId)) {
      newSet.delete(endpointId);
    } else {
      newSet.add(endpointId);
    }
    setSelectedPlanEndpoints(newSet);
  };

  const saveEndpoints = async () => {
    if (!planCode) return;
    setSaving(true);
    try {
      await subscriptionApi.replacePlanEndpoints(planCode, Array.from(selectedPlanEndpoints));
      // Show success message
      alert(`Successfully updated endpoints for plan ${planCode}!`);
      // Optionally reload to see updated state
      await loadData();
    } catch (err: any) {
      console.error('Failed to save endpoints', err);
      alert(err?.response?.data?.message || 'Failed to save endpoints. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Select all endpoints
  const handleSelectAll = () => {
    const allIds = new Set(allEndpoints.map(ep => ep.id));
    setSelectedPlanEndpoints(allIds);
  };

  // Deselect all endpoints
  const handleDeselectAll = () => {
    setSelectedPlanEndpoints(new Set());
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!plan) return <Layout><Typography>Plan not found. Please create the plan first.</Typography></Layout>;

  const isTrialPlan = planCode === 'TRIAL';

  const colorScheme = { primary: '#1976d2', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/subscriptions')}>Back</Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>Manage Endpoints</Typography>
            {isTrialPlan && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Default TRIAL endpoints - Auto-created for new users without subscriptions
              </Typography>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Side - Plan Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              {/* Header with gradient */}
              <Box
                sx={{
                  background: plan.active ? colorScheme.gradient : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                  color: 'white',
                  p: 3,
                }}
              >
                <Chip
                  label={plan.code}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 700,
                    mb: 1,
                  }}
                />
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {plan.name}
                </Typography>
                {plan.description && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {plan.description}
                  </Typography>
                )}
              </Box>

              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Monthly Price</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ₹{plan.priceMonthly?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Yearly Price</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ₹{plan.priceYearly?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Trial Days</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {plan.trialDays || 0} days
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip
                      label={plan.active ? 'Active' : 'Inactive'}
                      color={plan.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  {isTrialPlan && (
                    <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Default Endpoints Included:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip label="Inventory APIs" size="small" variant="outlined" />
                        <Chip label="Customer APIs" size="small" variant="outlined" />
                        <Chip label="Sale APIs" size="small" variant="outlined" />
                        <Chip label="Purchase/Bill APIs" size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
                        Account/Ledger APIs are excluded by default
                      </Typography>
                    </Box>
                  )}
                  {plan.createdAt && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Created</Typography>
                      <Typography variant="body2">
                        {format(new Date(plan.createdAt), 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Selected: {selectedPlanEndpoints.size} / {allEndpoints.length} endpoints
                    </Typography>
                    {isTrialPlan && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        These endpoints will be available to all new users with TRIAL subscription
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Endpoints */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                {/* Search and Bulk Actions */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search endpoints by method or path (e.g., GET /api/sales)"
                    value={endpointSearch}
                    onChange={(e) => setEndpointSearch(e.target.value)}
                    sx={{ flex: 1, minWidth: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: endpointSearch ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setEndpointSearch('')}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSelectAll}
                    sx={{ textTransform: 'none' }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDeselectAll}
                    sx={{ textTransform: 'none' }}
                  >
                    Deselect All
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {selectedPlanEndpoints.size} / {allEndpoints.length} selected
                  </Typography>
                </Box>

                {/* Categorized Endpoints */}
                <Box sx={{ maxHeight: 700, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {Object.keys(filteredGroupedEndpoints).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No endpoints found</Typography>
                    </Box>
                  ) : (
                    Object.keys(filteredGroupedEndpoints).map((category) => {
                      const categoryEndpoints = filteredGroupedEndpoints[category];
                      const isFullySelected = isCategoryFullySelected(category);
                      const isPartiallySelected = isCategoryPartiallySelected(category);
                      const isAccountLedger = category === 'Account/Ledger';
                      const isTrialDefaultCategory = isTrialPlan && 
                        (category === 'Inventory' || category === 'Customers' || category === 'Sales' || category === 'Purchase/Bill');

                      return (
                        <Accordion 
                          key={category} 
                          defaultExpanded={isTrialDefaultCategory}
                          sx={{
                            '&:before': { display: 'none' },
                            boxShadow: 'none',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Checkbox
                                checked={isFullySelected}
                                indeterminate={isPartiallySelected}
                                onChange={() => handleCategoryToggle(category)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{ p: 0 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {category}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {categoryEndpoints.length} endpoint{categoryEndpoints.length !== 1 ? 's' : ''}
                                  {isTrialPlan && isAccountLedger && ' (Excluded by default for TRIAL)'}
                                  {isTrialPlan && isTrialDefaultCategory && ' (Included by default for TRIAL)'}
                                </Typography>
                              </Box>
                              <Chip 
                                label={`${categoryEndpoints.filter(ep => selectedPlanEndpoints.has(ep.id)).length}/${categoryEndpoints.length}`}
                                size="small"
                                color={isFullySelected ? 'success' : isPartiallySelected ? 'warning' : 'default'}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1.5}>
                              {categoryEndpoints.map((ep) => (
                                <Grid item xs={12} key={ep.id}>
                                  <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1.5, 
                                      p: 1.5, 
                                      borderRadius: 1,
                                      bgcolor: selectedPlanEndpoints.has(ep.id) ? 'action.selected' : 'transparent',
                                      '&:hover': { bgcolor: 'action.hover' },
                                      transition: 'background-color 0.2s',
                                    }}
                                  >
                                    <Checkbox
                                      checked={selectedPlanEndpoints.has(ep.id)}
                                      onChange={() => handleEndpointToggle(ep.id)}
                                      size="small"
                                    />
                                    <Chip 
                                      label={ep.httpMethod} 
                                      size="small" 
                                      sx={{ 
                                        minWidth: 60, 
                                        height: 24,
                                        fontWeight: 600,
                                        bgcolor: ep.httpMethod === 'GET' ? 'info.light' :
                                                 ep.httpMethod === 'POST' ? 'success.light' :
                                                 ep.httpMethod === 'PUT' ? 'warning.light' :
                                                 ep.httpMethod === 'DELETE' ? 'error.light' : 'default.light',
                                        color: 'text.primary',
                                      }}
                                    />
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        flex: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {ep.pathPattern}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                  )}
                </Box>

                {/* Save Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/subscriptions')}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={saveEndpoints}
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? 'Saving...' : 'Save Endpoints'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Layout>
  );
};

export default ManagePlanEndpoints;

