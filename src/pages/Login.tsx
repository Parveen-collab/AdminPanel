import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ThemeToggle } from '../components/common/ThemeToggle';

const Illustration = () => (
  <Box sx={{ width: '100%', maxWidth: 420 }}>
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#42a5f5" />
          <stop offset="100%" stopColor="#7e57c2" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="300" rx="24" fill="url(#grad)" opacity="0.12" />
      <circle cx="90" cy="80" r="36" fill="#42a5f5" opacity="0.25" />
      <circle cx="320" cy="200" r="44" fill="#7e57c2" opacity="0.25" />
      <rect x="70" y="120" width="260" height="120" rx="12" fill="#ffffff" opacity="0.9" />
      <rect x="90" y="140" width="140" height="12" rx="6" fill="#90caf9" />
      <rect x="90" y="162" width="200" height="12" rx="6" fill="#b39ddb" />
      <rect x="90" y="186" width="120" height="12" rx="6" fill="#80cbc4" />
    </svg>
  </Box>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);
      
      if ((response.status?.toUpperCase() === 'SUCCESS' || response.status === 'success') && response.payload) {
        console.log('Storing token:', response.payload.userToken);
        localStorage.setItem('token', response.payload.userToken);
        localStorage.setItem('refreshToken', response.payload.refreshToken || '');
        console.log('Token stored, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.log('Login failed:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => 
          theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        p: 2,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Welcome back
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Manage shops, users, and analytics in one place.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                "Great data leads to great decisions."
              </Typography>
              <Illustration />
            </Grid>
            <Grid item xs={12} md={6}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  margin="normal"
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  margin="normal"
                  autoComplete="current-password"
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3, mb: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Tip: Use your admin credentials to access analytics.
                </Typography>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

