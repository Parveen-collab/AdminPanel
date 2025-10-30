import apiClient from './apiConfig';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  payload: {
    userToken: string;
    refreshToken?: string;
    role: string;
    shopId: string;
    email: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/login/jwt', credentials);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};

