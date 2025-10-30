import apiClient from './apiConfig';

export interface SubscriptionPlan {
  id?: number;
  code: string;
  name: string;
  description?: string;
  featuresJson?: string;
  priceMonthly?: number;
  priceYearly?: number;
  trialDays?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planCode: string;
  planNameSnapshot: string;
  startDate: string;
  endDate: string;
  period: 'TRIAL' | 'MONTHLY' | 'YEARLY';
  active: boolean;
  pricePaid?: number;
  paymentTxnId?: string;
  subscribedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const subscriptionApi = {
  listPlans: async () => (await apiClient.get('/api/subscriptions/plans')).data,
  upsertPlan: async (plan: SubscriptionPlan) => (await apiClient.post('/api/subscriptions/plans', plan)).data,
  deactivatePlan: async (id: number) => (await apiClient.post(`/api/subscriptions/plans/${id}/deactivate`)).data,
  ensureTrial: async (userId: number) => (await apiClient.post(`/api/subscriptions/start-trial/${userId}`)).data,
  subscribe: async (userId: number, planCode: string, period: 'MONTHLY'|'YEARLY', amount?: number) =>
    (await apiClient.post(`/api/subscriptions/subscribe/${userId}`, null, { params: { planCode, period, amount } })).data,
  current: async (userId: number) => (await apiClient.get(`/api/subscriptions/current/${userId}`)).data,
  history: async (userId: number, page=0, size=10) => (await apiClient.get(`/api/subscriptions/history/${userId}`, { params: { page, size } })).data,
  historyFiltered: async (req: any) => (await apiClient.post('/api/subscriptions/admin/history', req)).data,
  analyticsSummary: async (startDate: string, endDate: string) => (await apiClient.get('/api/subscriptions/admin/analytics/summary', { params: { startDate, endDate } })).data,
  listAdminEndpoints: async () => (await apiClient.get('/api/subscriptions/admin/endpoints')).data,
  listPlanEndpoints: async (planCode: string) => (await apiClient.get(`/api/subscriptions/plans/${planCode}/endpoints`)).data,
  replacePlanEndpoints: async (planCode: string, endpointIds: number[]) => 
    (await apiClient.put(`/api/subscriptions/plans/${planCode}/endpoints`, { endpointIds })).data,
  importAdminEndpoints: async (endpoints: { httpMethod: string; pathPattern: string }[]) =>
    (await apiClient.post('/api/subscriptions/admin/endpoints/import', endpoints)).data,
  discoverEndpoints: async () => (await apiClient.get('/api/endpoints/discover')).data,
  addPlanEndpoint: async (planCode: string, httpMethod: string, pathPattern: string) => 
    (await apiClient.post(`/api/subscriptions/plans/${planCode}/endpoints`, { httpMethod, pathPattern })).data,
  deletePlanEndpoint: async (planCode: string, id: number) => 
    (await apiClient.delete(`/api/subscriptions/plans/${planCode}/endpoints/${id}`)).data,
  subscribers: async (planCode?: string) => (await apiClient.get('/api/subscriptions/admin/subscribers', { params: planCode ? { planCode } : {} })).data,
};


