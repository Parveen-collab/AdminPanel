import apiClient from './apiConfig';

export interface SalesAnalyticsStats {
  totalSalesOfProducts: number;
  thisMonthTotalSales: number;
  lastMonthTotalSales: number;
  increaseOrDecreasePercentage: number | null;
  todayTotalSales: number;
}

export interface CategorySale {
  category: string;
  totalAmount: number;
  totalQuantity: number;
  percentage: number;
}

export interface CategoryWiseDistribution {
  categorySales: CategorySale[];
}

export interface CompanySale {
  company: string;
  totalAmount: number;
  totalQuantity: number;
  percentage: number;
}

export interface CompanyWiseDistribution {
  companySales: CompanySale[];
}

export interface MonthlySalesData {
  monthlyData: MonthData[];
}

export interface MonthData {
  month: string;
  monthNumber: number;
  totalAmount: number;
  totalQuantity: number;
  companyWiseData: CompanyData[];
}

export interface CompanyData {
  company: string;
  amount: number;
  quantity: number;
}

export interface ModelSale {
  model: string;
  company: string;
  category: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface TopSellingModels {
  topModels: ModelSale[];
}

export interface ProductLevelPayment {
  company: string;
  model: string;
  category: string;
  cashAmount: number;
  duesAmount: number;
  emiAmount: number;
  totalAmount: number;
}

export interface PaymentModeStats {
  totalCashAmount: number;
  totalCashCount: number;
  totalDuesAmount: number;
  totalDuesCount: number;
  totalEmiAmount: number;
  totalEmiCount: number;
  grandTotal: number;
  grandTotalCount: number;
  productLevelPayments: ProductLevelPayment[] | null;
}

export interface ApiFilters {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  company?: string;
  category?: string;
  model?: string;
  limit?: number;
}

export const salesAnalyticsApi = {
  getStats: async (): Promise<SalesAnalyticsStats> => {
    const response = await apiClient.get('/api/admin/sales-analytics/stats');
    return response.data?.payload || response.data;
  },

  getCategoryDistribution: async (filters?: ApiFilters): Promise<CategoryWiseDistribution> => {
    const params: any = {};
    if (filters?.year) params.year = filters.year;
    if (filters?.month) params.month = filters.month;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.company) params.company = filters.company;
    
    const response = await apiClient.get('/api/admin/sales-analytics/category-distribution', { params });
    return response.data?.payload || response.data;
  },

  getCompanyDistribution: async (filters?: ApiFilters): Promise<CompanyWiseDistribution> => {
    const params: any = {};
    if (filters?.year) params.year = filters.year;
    if (filters?.month) params.month = filters.month;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    
    const response = await apiClient.get('/api/admin/sales-analytics/company-distribution', { params });
    return response.data?.payload || response.data;
  },

  getMonthlySales: async (filters?: ApiFilters): Promise<MonthlySalesData> => {
    const params: any = {};
    if (filters?.year) params.year = filters.year;
    if (filters?.company) params.company = filters.company;
    if (filters?.category) params.category = filters.category;
    
    const response = await apiClient.get('/api/admin/sales-analytics/monthly-sales', { params });
    return response.data?.payload || response.data;
  },

  getTopModels: async (filters?: ApiFilters): Promise<TopSellingModels> => {
    const params: any = {};
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.company) params.company = filters.company;
    if (filters?.category) params.category = filters.category;
    if (filters?.year) params.year = filters.year;
    if (filters?.month) params.month = filters.month;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    
    const response = await apiClient.get('/api/admin/sales-analytics/top-models', { params });
    return response.data?.payload || response.data;
  },

  getPaymentStats: async (filters?: ApiFilters): Promise<PaymentModeStats> => {
    const params: any = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.company) params.company = filters.company;
    if (filters?.model) params.model = filters.model;
    if (filters?.category) params.category = filters.category;
    
    const response = await apiClient.get('/api/admin/sales-analytics/payment-stats', { params });
    return response.data?.payload || response.data;
  },
};

