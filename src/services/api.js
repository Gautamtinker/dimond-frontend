import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 (unauthorized), not on connection errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updatePassword: (data) => api.put("/auth/updatepassword", data),
  updateFCMToken: (token) => api.post("/auth/fcm-token", { fcmToken: token }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getNotifications: (limit = 10) =>
    api.get(`/dashboard/notifications?limit=${limit}`),
  getUpcomingDues: () => api.get("/dashboard/upcoming-dues"),
  getUpcomingSaleDues: () => api.get("/dashboard/upcoming-sale-dues"),
  markNotificationAsRead: (id) =>
    api.put(`/dashboard/notifications/${id}/read`),
  markAllNotificationsAsRead: () =>
    api.put("/dashboard/notifications/read-all"),
  getCashFlow: (params) => api.get("/dashboard/cashflow", { params }),
};

// Purchase APIs
export const purchaseAPI = {
  getAll: (params) => api.get("/purchases", { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post("/purchases", data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
  getSummary: (params) => api.get("/purchases/summary", { params }),
  checkOverdue: () => api.post("/purchases/check-overdue"),
};

// Purchase Payment APIs
export const purchasePaymentAPI = {
  getAll: (params) => api.get("/purchase-payments", { params }),
  getById: (id) => api.get(`/purchase-payments/${id}`),
  create: (data) => api.post("/purchase-payments", data),
  update: (id, data) => api.put(`/purchase-payments/${id}`, data),
  delete: (id) => api.delete(`/purchase-payments/${id}`),
  getByPurchase: (purchaseId) =>
    api.get(`/purchase-payments/purchase/${purchaseId}`),
};

// Sale APIs
export const saleAPI = {
  getAll: (params) => api.get("/sales", { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post("/sales", data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  getSummary: (params) => api.get("/sales/summary", { params }),
  checkOverdue: () => api.post("/sales/check-overdue"),
};

// Sale Payment APIs
export const salePaymentAPI = {
  getAll: (params) => api.get("/sale-payments", { params }),
  getById: (id) => api.get(`/sale-payments/${id}`),
  create: (data) => api.post("/sale-payments", data),
  update: (id, data) => api.put(`/sale-payments/${id}`, data),
  delete: (id) => api.delete(`/sale-payments/${id}`),
  getBySale: (saleId) => api.get(`/sale-payments/sale/${saleId}`),
};

// Approval APIs
export const approvalAPI = {
  getAll: (params) => api.get("/approvals", { params }),
  getById: (id) => api.get(`/approvals/${id}`),
  create: (data) => api.post("/approvals", data),
  update: (id, data) => api.put(`/approvals/${id}`, data),
  delete: (id) => api.delete(`/approvals/${id}`),
  markMaterialAsSold: (approvalId, materialId, data) =>
    api.put(`/approvals/${approvalId}/materials/${materialId}/sold`, data),
  markMaterialAsReturned: (approvalId, materialId) =>
    api.put(`/approvals/${approvalId}/materials/${materialId}/returned`),
  getPendingSummary: () => api.get("/approvals/summary/pending"),
};

// Report APIs
export const reportAPI = {
  generatePurchaseReport: (params) =>
    api.get("/reports/purchases", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateSalesReport: (params) =>
    api.get("/reports/sales", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateApprovalReport: (params) =>
    api.get("/reports/approvals", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateVendorOutstandingReport: (params) =>
    api.get("/reports/outstanding/vendors", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateBuyerOutstandingReport: (params) =>
    api.get("/reports/outstanding/buyers", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateBrokerCommissionReport: (params) =>
    api.get("/reports/broker-commission", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateStockReport: (params) =>
    api.get("/reports/stock", {
      params,
      responseType: params.format === "json" ? "json" : "blob",
    }),
  generateProfitLossReport: (params) =>
    api.get("/reports/profit-loss", { params }),
  generateCashFlowReport: (params) => api.get("/reports/cashflow", { params }),
};

export default api;
