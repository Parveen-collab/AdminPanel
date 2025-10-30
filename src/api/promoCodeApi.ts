import apiClient from './apiConfig';

export interface PromoCode {
  id?: number;
  code: string;
  description?: string;
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  discountValue: number;
  validFrom: string;
  validTo: string;
  applicablePlanCodes?: string; // JSON array string
  applicableToNewSubscription: boolean;
  applicableToUpgrade: boolean;
  isUsed: boolean;
  usedAt?: string;
  usedByUserId?: number;
  maxUses?: number;
  currentUses: number;
  minPurchaseAmount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const promoCodeApi = {
  getAll: async (page = 0, size = 10) => (await apiClient.get('/api/promo-codes', { params: { page, size } })).data,
  getById: async (id: number) => (await apiClient.get(`/api/promo-codes/${id}`)).data,
  create: async (promoCode: PromoCode) => (await apiClient.post('/api/promo-codes', promoCode)).data,
  generate: async (promoCode: PromoCode, length = 8) => 
    (await apiClient.post('/api/promo-codes/generate', promoCode, { params: { length } })).data,
  update: async (id: number, promoCode: PromoCode) => 
    (await apiClient.put(`/api/promo-codes/${id}`, promoCode)).data,
  delete: async (id: number) => (await apiClient.delete(`/api/promo-codes/${id}`)).data,
  getByStatus: async (isUsed: boolean) => 
    (await apiClient.get(`/api/promo-codes/status/${isUsed}`)).data,
  getStats: async () => (await apiClient.get('/api/promo-codes/stats')).data,
  getUsageOverTime: async (startDate: string, endDate: string) => 
    (await apiClient.get('/api/promo-codes/usage-over-time', { params: { startDate, endDate } })).data,
  getMonthlyStatsByYear: async (year: number) => 
    (await apiClient.get(`/api/promo-codes/monthly-stats/${year}`)).data,
  getMostUsed: async (limit = 10) => 
    (await apiClient.get('/api/promo-codes/most-used', { params: { limit } })).data,
  validate: async (code: string, planCode: string, baseAmount: number, isUpgrade = false) =>
    (await apiClient.post('/api/promo-codes/validate', null, { 
      params: { code, planCode, baseAmount, isUpgrade } 
    })).data,
  check: async (code: string) => (await apiClient.get(`/api/promo-codes/check/${code}`)).data,
};

