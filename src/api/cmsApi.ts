import apiClient from './apiConfig';

// Feature Interfaces
export interface Feature {
  id?: number;
  heading: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface FeatureRequest {
  heading: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// HomePage Interfaces
export interface HomePage {
  id?: number;
  header: string;
  subHeading?: string;
  content?: string;
  imageUrl?: string;
  customerRatings?: number;
  totalBusiness?: number;
  upTime?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface HomePageRequest {
  header: string;
  subHeading?: string;
  content?: string;
  imageUrl?: string;
  customerRatings?: number;
  totalBusiness?: number;
  upTime?: string;
  isActive?: boolean;
}

// ShopInAction Interfaces
export interface ShopInAction {
  id?: number;
  heading: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ShopInActionRequest {
  heading: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// CustomerReview Interfaces
export interface CustomerReview {
  id?: number;
  name: string;
  address?: string;
  shopName: string;
  review: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CustomerReviewRequest {
  name: string;
  address?: string;
  shopName: string;
  review: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// AboutUs Interfaces
export interface AboutUs {
  id?: number;
  header: string;
  subHeader?: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AboutUsRequest {
  header: string;
  subHeader?: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
}

// Team Interfaces
export interface Team {
  id?: number;
  name: string;
  jobRole?: string;
  portfolioLink?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TeamRequest {
  name: string;
  jobRole?: string;
  portfolioLink?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// Enquiry Interfaces
export interface Enquiry {
  id?: number;
  name: string;
  phoneNo: string;
  email: string;
  shopName?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface EnquiryRequest {
  name: string;
  phoneNo: string;
  email: string;
  shopName?: string;
  message: string;
}

// API Client
export const cmsApi = {
  // Features
  getFeatures: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/features', { params })).data;
  },
  getFeatureById: async (id: number) => (await apiClient.get(`/api/features/${id}`)).data,
  createFeature: async (feature: FeatureRequest) => (await apiClient.post('/api/features', feature)).data,
  updateFeature: async (id: number, feature: FeatureRequest) => (await apiClient.put(`/api/features/${id}`, feature)).data,
  deleteFeature: async (id: number) => (await apiClient.delete(`/api/features/${id}`)).data,
  uploadFeatureImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/features/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // Home Pages
  getHomePages: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/home-pages', { params })).data;
  },
  getHomePageById: async (id: number) => (await apiClient.get(`/api/home-pages/${id}`)).data,
  createHomePage: async (homePage: HomePageRequest) => (await apiClient.post('/api/home-pages', homePage)).data,
  updateHomePage: async (id: number, homePage: HomePageRequest) => (await apiClient.put(`/api/home-pages/${id}`, homePage)).data,
  deleteHomePage: async (id: number) => (await apiClient.delete(`/api/home-pages/${id}`)).data,
  uploadHomePageImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/home-pages/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // Shop In Action
  getShopInActions: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/shop-in-actions', { params })).data;
  },
  getShopInActionById: async (id: number) => (await apiClient.get(`/api/shop-in-actions/${id}`)).data,
  createShopInAction: async (shopInAction: ShopInActionRequest) => (await apiClient.post('/api/shop-in-actions', shopInAction)).data,
  updateShopInAction: async (id: number, shopInAction: ShopInActionRequest) => (await apiClient.put(`/api/shop-in-actions/${id}`, shopInAction)).data,
  deleteShopInAction: async (id: number) => (await apiClient.delete(`/api/shop-in-actions/${id}`)).data,
  uploadShopInActionImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/shop-in-actions/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // Customer Reviews
  getCustomerReviews: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/customer-reviews', { params })).data;
  },
  getCustomerReviewById: async (id: number) => (await apiClient.get(`/api/customer-reviews/${id}`)).data,
  createCustomerReview: async (review: CustomerReviewRequest) => (await apiClient.post('/api/customer-reviews', review)).data,
  updateCustomerReview: async (id: number, review: CustomerReviewRequest) => (await apiClient.put(`/api/customer-reviews/${id}`, review)).data,
  deleteCustomerReview: async (id: number) => (await apiClient.delete(`/api/customer-reviews/${id}`)).data,
  uploadCustomerReviewImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/customer-reviews/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // About Us
  getAboutUs: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/about-us', { params })).data;
  },
  getAboutUsById: async (id: number) => (await apiClient.get(`/api/about-us/${id}`)).data,
  createAboutUs: async (aboutUs: AboutUsRequest) => (await apiClient.post('/api/about-us', aboutUs)).data,
  updateAboutUs: async (id: number, aboutUs: AboutUsRequest) => (await apiClient.put(`/api/about-us/${id}`, aboutUs)).data,
  deleteAboutUs: async (id: number) => (await apiClient.delete(`/api/about-us/${id}`)).data,
  uploadAboutUsImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/about-us/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // Team
  getTeams: async (activeOnly?: boolean) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return (await apiClient.get('/api/teams', { params })).data;
  },
  getTeamById: async (id: number) => (await apiClient.get(`/api/teams/${id}`)).data,
  createTeam: async (team: TeamRequest) => (await apiClient.post('/api/teams', team)).data,
  updateTeam: async (id: number, team: TeamRequest) => (await apiClient.put(`/api/teams/${id}`, team)).data,
  deleteTeam: async (id: number) => (await apiClient.delete(`/api/teams/${id}`)).data,
  uploadTeamImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await apiClient.post(`/api/teams/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  // Enquiries
  getEnquiries: async (unreadOnly?: boolean) => {
    const params = unreadOnly !== undefined ? { unreadOnly } : {};
    return (await apiClient.get('/api/enquiries', { params })).data;
  },
  getEnquiryById: async (id: number) => (await apiClient.get(`/api/enquiries/${id}`)).data,
  createEnquiry: async (enquiry: EnquiryRequest) => (await apiClient.post('/api/enquiries', enquiry)).data,
  markEnquiryAsRead: async (id: number) => (await apiClient.put(`/api/enquiries/${id}/mark-read`)).data,
  deleteEnquiry: async (id: number) => (await apiClient.delete(`/api/enquiries/${id}`)).data,
};

