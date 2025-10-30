import apiClient from './apiConfig';

export interface UserActivityStatus {
  userId: number;
  email: string;
  isActive: boolean;
  lastLoginTime: string | null;
  lastActivityTime: string | null;
  minutesSinceLastActivity: number;
  inactivityThresholdMinutes: number;
}

export const userActivityApi = {
  // Check if a specific user is active
  checkUserActivity: async (userId: number, inactivityMinutes: number = 15) => {
    const response = await apiClient.get(`/api/user-activity/check/${userId}?inactivityMinutes=${inactivityMinutes}`);
    return response.data?.payload || response.data;
  },

  // Get activity status for current logged-in user
  getMyActivityStatus: async (inactivityMinutes: number = 15) => {
    const response = await apiClient.get(`/api/user-activity/my-status?inactivityMinutes=${inactivityMinutes}`);
    return response.data?.payload || response.data;
  },

  // Get all user activity statuses
  getAllStatuses: async () => {
    const response = await apiClient.get('/api/user-activity/all-status');
    return response.data?.payload || response.data;
  },
};

