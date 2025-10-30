import apiClient from './apiConfig';

export interface CustomerStatsSummary {
  totalCustomers: number;
  totalRepeatCustomers: number;
  totalNewCustomers: number;
  previousYearCustomers: number;
  growthPercentage: number;
  increment: number;
  decrement: number;
}

export interface MonthlyCustomerData {
  month: number;
  monthName: string;
  newCustomers: number;
  repeatCustomers: number;
  totalCustomers: number;
  increment: number;
  decrement: number;
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  phone: string;
  village: string;
  totalPurchase: number;
  totalQuantity: number;
}

export interface DistributionData {
  village?: string;
  gender?: string;
  count: number;
}

export const customerStatsApi = {
  getStatsSummary: async (year?: number) => {
    const params = year ? { year } : {};
    return (await apiClient.get('/api/customers/admin/stats/summary', { params })).data;
  },
  getMonthlyData: async (year?: number) => {
    const params = year ? { year } : {};
    return (await apiClient.get('/api/customers/admin/stats/monthly', { params })).data;
  },
  getTopByPurchase: async (year?: number, limit: number = 10) => {
    const params: any = { limit };
    if (year) params.year = year;
    return (await apiClient.get('/api/customers/admin/stats/top/purchase', { params })).data;
  },
  getTopByQuantity: async (year?: number, limit: number = 10) => {
    const params: any = { limit };
    if (year) params.year = year;
    return (await apiClient.get('/api/customers/admin/stats/top/quantity', { params })).data;
  },
  getVillageDistribution: async (year?: number) => {
    const params = year ? { year } : {};
    return (await apiClient.get('/api/customers/admin/stats/distribution/village', { params })).data;
  },
};

