import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime,
  Login,
  TrendingUp,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { userActivityApi, UserActivityStatus } from '../../api/userActivityApi';

interface ActivityTabProps {
  userId: number;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ userId }) => {
  const [activityData, setActivityData] = useState<UserActivityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactivityThreshold, setInactivityThreshold] = useState(15);
  const [customThreshold, setCustomThreshold] = useState('');

  useEffect(() => {
    loadActivityData();
  }, [userId, inactivityThreshold]);

  const loadActivityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userActivityApi.checkUserActivity(userId, inactivityThreshold);
      setActivityData(data);
    } catch (err: any) {
      console.error('Failed to load activity data', err);
      setError(err.response?.data?.message || err.message || 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadActivityData();
  };

  const handleApplyCustomThreshold = () => {
    const minutes = parseInt(customThreshold);
    if (!isNaN(minutes) && minutes > 0) {
      setInactivityThreshold(minutes);
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'Never';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateTimeStr;
    }
  };

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${Math.floor(minutes)} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getActivityStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getActivityStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle /> : <Cancel />;
  };

  if (loading && !activityData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading activity data...</Typography>
      </Box>
    );
  }

  if (error && !activityData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!activityData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No activity data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with Refresh */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            User Activity Status
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Activity Status Card */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: activityData.isActive ? 'success.light' : 'grey.300',
                      color: activityData.isActive ? 'success.dark' : 'grey.600',
                    }}
                  >
                    {getActivityStatusIcon(activityData.isActive)}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip
                      label={activityData.isActive ? 'Active' : 'Inactive'}
                      color={getActivityStatusColor(activityData.isActive)}
                      icon={getActivityStatusIcon(activityData.isActive)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Last Activity
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatTimeAgo(activityData.minutesSinceLastActivity)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({activityData.minutesSinceLastActivity} minutes since last activity)
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Login color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Login Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDateTime(activityData.lastLoginTime)}
                  </Typography>
                  {activityData.lastLoginTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {new Date(activityData.lastLoginTime).toLocaleDateString('en-IN', {
                        weekday: 'long',
                      })}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TrendingUp color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Activity Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDateTime(activityData.lastActivityTime)}
                  </Typography>
                  {activityData.lastActivityTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {formatTimeAgo(activityData.minutesSinceLastActivity)}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Configuration */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Activity Configuration
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Inactivity Threshold
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {inactivityThreshold} minutes
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Custom Threshold (minutes)"
                type="number"
                value={customThreshold}
                onChange={(e) => setCustomThreshold(e.target.value)}
                size="small"
                inputProps={{ min: 1 }}
                helperText="Set custom inactivity threshold"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                onClick={handleApplyCustomThreshold}
                fullWidth
                disabled={!customThreshold || isNaN(parseInt(customThreshold))}
              >
                Apply Threshold
              </Button>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            A user is considered "Active" if their last activity was within the threshold period.
            Default threshold is 15 minutes.
          </Typography>
        </Paper>

        {/* Activity Summary */}
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Activity Summary
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                User ID:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {activityData.userId}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {activityData.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Minutes Since Last Activity:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {activityData.minutesSinceLastActivity === -1
                  ? 'Never'
                  : `${activityData.minutesSinceLastActivity} minutes`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Status Based on Threshold:
              </Typography>
              <Chip
                label={activityData.isActive ? 'ACTIVE' : 'INACTIVE'}
                color={getActivityStatusColor(activityData.isActive)}
                size="small"
              />
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ActivityTab;

