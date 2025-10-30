import apiClient from './apiConfig';

// Types
export interface AdminUserFilterRequest {
  search?: string;
  state?: string;
  location?: string;
  pincode?: string;
  referralCode?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  status?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface MonthlyChartRequest {
  year?: number;
  state?: string;
  pincode?: string;
  referralCode?: string;
}

// API Functions
export const adminUserApi = {
  // Get all users with filters
  getAllUsers: async (filters: AdminUserFilterRequest) => {
    const response = await apiClient.post('/users/admin/users', filters);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number) => {
    const response = await apiClient.get(`/users/admin/users/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await apiClient.get('/users/admin/users/stats');
    return response.data;
  },

  // Get monthly chart data
  getMonthlyCharts: async (params: MonthlyChartRequest) => {
    const queryParams = new URLSearchParams();
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.state) queryParams.append('state', params.state);
    if (params.pincode) queryParams.append('pincode', params.pincode);
    if (params.referralCode) queryParams.append('referralCode', params.referralCode);
    
    const response = await apiClient.get(`/users/admin/users/stats/monthly?${queryParams.toString()}`);
    return response.data;
  },

  // Get distribution by state
  getStateDistribution: async () => {
    const response = await apiClient.get('/users/admin/users/stats/distribution/state');
    return response.data;
  },

  // Get distribution by pincode
  getPincodeDistribution: async () => {
    const response = await apiClient.get('/users/admin/users/stats/distribution/pincode');
    return response.data;
  },

  // Get distribution by location
  getLocationDistribution: async () => {
    const response = await apiClient.get('/users/admin/users/stats/distribution/location');
    return response.data;
  },
};

