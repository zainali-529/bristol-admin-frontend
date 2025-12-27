import axiosInstance from '@/lib/axios'

export const apiService = {
  // Theme - Public Routes
  getActiveTheme: () => axiosInstance.get('/theme'),
  
  // Auth Routes
  login: (credentials) => axiosInstance.post('/admin/auth/login', credentials),
  logout: () => axiosInstance.post('/admin/auth/logout'),
  refreshToken: () => axiosInstance.post('/admin/auth/refresh'),
  forgotPassword: (email) => axiosInstance.post('/admin/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/admin/auth/reset-password', payload),
  getAdminProfile: () => axiosInstance.get('/admin/auth/profile'),
  updateAdminProfile: (data) => axiosInstance.patch('/admin/auth/profile', data),
  
  // Contact Routes - Admin
  getContacts: (params) => axiosInstance.get('/contacts/admin', { params }),
  getContactById: (id) => axiosInstance.get(`/contacts/admin/${id}`),
  updateContact: (id, data) => axiosInstance.put(`/contacts/admin/${id}`, data),
  updateContactStatus: (id, status) => axiosInstance.put(`/contacts/admin/${id}/status`, { status }),
  deleteContact: (id) => axiosInstance.delete(`/contacts/admin/${id}`),
  getContactStats: () => axiosInstance.get('/contacts/admin/stats'),
  
  // Quote Routes - Admin
  getQuotes: (params) => axiosInstance.get('/quotes/admin', { params }),
  getQuoteById: (id) => axiosInstance.get(`/quotes/admin/${id}`),
  updateQuote: (id, data) => axiosInstance.put(`/quotes/admin/${id}`, data),
  updateQuoteStatus: (id, status) => axiosInstance.put(`/quotes/admin/${id}/status`, { status }),
  deleteQuote: (id) => axiosInstance.delete(`/quotes/admin/${id}`),
  getQuoteStats: () => axiosInstance.get('/quotes/admin/stats'),
  
  // Supplier Routes - Admin
  getSuppliers: (params) => axiosInstance.get('/suppliers/admin', { params }),
  getSupplierById: (id) => axiosInstance.get(`/suppliers/admin/${id}`),
  createSupplier: (formData) => axiosInstance.post('/suppliers/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSupplier: (id, formData) => axiosInstance.put(`/suppliers/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSupplier: (id) => axiosInstance.delete(`/suppliers/admin/${id}`),
  updateSupplierStatus: (id, isActive) => axiosInstance.patch(`/suppliers/admin/${id}/status`, { isActive }),
  updateSupplierOrder: (id, displayOrder) => axiosInstance.patch(`/suppliers/admin/${id}/order`, { displayOrder }),
  getSupplierStats: () => axiosInstance.get('/suppliers/admin/stats'),
  
  // Why Trust Us Routes - Admin
  getTrustCards: () => axiosInstance.get('/why-trust-us/admin'),
  updateTrustCards: (data) => axiosInstance.put('/why-trust-us/admin', data),
  updateSingleTrustCard: (order, cardData) => axiosInstance.patch(`/why-trust-us/admin/card/${order}`, cardData),
  updateTrustStatus: (isActive) => axiosInstance.patch('/why-trust-us/admin/status', { isActive }),

  // Services - Admin Routes
  getServices: (params) => axiosInstance.get('/services/admin', { params }),
  getServiceById: (id) => axiosInstance.get(`/services/admin/${id}`),
  createService: (data) => axiosInstance.post('/services/admin', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateService: (id, data) => axiosInstance.put(`/services/admin/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteService: (id) => axiosInstance.delete(`/services/admin/${id}`),
  updateServiceStatus: (id, isActive) => axiosInstance.patch(`/services/admin/${id}/status`, { isActive }),
  updateServiceOrder: (id, displayOrder) => axiosInstance.patch(`/services/admin/${id}/order`, { displayOrder }),
  getServiceStats: () => axiosInstance.get('/services/admin/stats'),

  // Industries - Admin Routes
  getIndustries: (params) => axiosInstance.get('/industries/admin', { params }),
  getIndustryById: (id) => axiosInstance.get(`/industries/admin/${id}`),
  createIndustry: (formData) => axiosInstance.post('/industries/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateIndustry: (id, formData) => axiosInstance.put(`/industries/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteIndustry: (id) => axiosInstance.delete(`/industries/admin/${id}`),
  updateIndustryStatus: (id, isActive) => axiosInstance.patch(`/industries/admin/${id}/status`, { isActive }),
  updateIndustryOrder: (id, displayOrder) => axiosInstance.patch(`/industries/admin/${id}/order`, { displayOrder }),

  // Testimonials - Admin Routes
  getAdminTestimonials: (params) => axiosInstance.get('/testimonials/admin', { params }),
  getAdminTestimonialById: (id) => axiosInstance.get(`/testimonials/admin/${id}`),
  createTestimonial: (data) => axiosInstance.post('/testimonials/admin', data),
  updateTestimonial: (id, data) => axiosInstance.put(`/testimonials/admin/${id}`, data),
  deleteTestimonial: (id) => axiosInstance.delete(`/testimonials/admin/${id}`),
  updateTestimonialStatus: (id, isActive) => axiosInstance.patch(`/testimonials/admin/${id}/status`, { isActive }),
  updateTestimonialOrder: (id, displayOrder) => axiosInstance.patch(`/testimonials/admin/${id}/order`, { displayOrder }),
  getTestimonialStats: () => axiosInstance.get('/testimonials/admin/stats'),

  // Energy Prices - Admin Routes
  getEnergyPrices: (params) => axiosInstance.get('/energy-prices/admin/all', { params }),
  getEnergyPriceById: (id) => axiosInstance.get(`/energy-prices/admin/${id}`),
  getCurrentEnergyPrice: () => axiosInstance.get('/energy-prices/current'),
  createOrUpdateEnergyPrice: (data) => axiosInstance.post('/energy-prices/admin', data),
  updateMarketInsights: (data) => axiosInstance.put('/energy-prices/admin/insights', data),
  deleteEnergyPrice: (id) => axiosInstance.delete(`/energy-prices/admin/${id}`),

  // Theme - Admin Routes
  updateTheme: (data) => axiosInstance.post('/theme/admin', data),
  updatePrimaryColor: (data) => axiosInstance.put('/theme/admin/primary-color', data),
  uploadLogo: (formData) => axiosInstance.post('/theme/admin/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadFavicon: (formData) => axiosInstance.post('/theme/admin/upload-favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLogo: () => axiosInstance.delete('/theme/admin/logo'),
  deleteFavicon: () => axiosInstance.delete('/theme/admin/favicon'),
  resetTheme: () => axiosInstance.post('/theme/admin/reset'),

  // FAQs - Admin Routes
  getFAQs: (params) => axiosInstance.get('/faqs/admin', { params }),
  getFAQById: (id) => axiosInstance.get(`/faqs/admin/${id}`),
  createFAQ: (data) => axiosInstance.post('/faqs/admin', data),
  updateFAQ: (id, data) => axiosInstance.put(`/faqs/admin/${id}`, data),
  deleteFAQ: (id) => axiosInstance.delete(`/faqs/admin/${id}`),
  updateFAQStatus: (id, isActive) => axiosInstance.patch(`/faqs/admin/${id}/status`, { isActive }),
  updateFAQOrder: (id, displayOrder) => axiosInstance.patch(`/faqs/admin/${id}/order`, { displayOrder }),
  getFAQStats: () => axiosInstance.get('/faqs/admin/stats'),
  getFAQCategories: () => axiosInstance.get('/faqs/categories'),

  // How We Work - Admin Routes
  getHowWeWork: () => axiosInstance.get('/how-we-work/admin'),
  updateHowWeWork: (formData) => axiosInstance.put('/how-we-work/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSingleStep: (order, formData) => axiosInstance.patch(`/how-we-work/admin/step/${order}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateHowWeWorkStatus: (isActive) => axiosInstance.patch('/how-we-work/admin/status', { isActive }),

  // News - Admin Routes
  getNews: (params) => axiosInstance.get('/news/admin', { params }),
  getNewsById: (id) => axiosInstance.get(`/news/admin/${id}`),
  createNews: (formData) => axiosInstance.post('/news/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateNews: (id, formData) => axiosInstance.put(`/news/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteNews: (id) => axiosInstance.delete(`/news/admin/${id}`),
  updateNewsStatus: (id, status) => axiosInstance.patch(`/news/admin/${id}/status`, { status }),
  updateNewsActive: (id, isActive) => axiosInstance.patch(`/news/admin/${id}/active`, { isActive }),
  updateNewsOrder: (id, displayOrder) => axiosInstance.patch(`/news/admin/${id}/order`, { displayOrder }),
  getNewsStats: () => axiosInstance.get('/news/admin/stats'),
  getNewsCategories: () => axiosInstance.get('/news/categories'),

  // Team Members - Admin Routes
  getTeamMembers: (params) => axiosInstance.get('/team-members/admin', { params }),
  getTeamMemberById: (id) => axiosInstance.get(`/team-members/admin/${id}`),
  createTeamMember: (formData) => axiosInstance.post('/team-members/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTeamMember: (id, formData) => axiosInstance.put(`/team-members/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTeamMember: (id) => axiosInstance.delete(`/team-members/admin/${id}`),
  updateTeamMemberStatus: (id, isActive) => axiosInstance.patch(`/team-members/admin/${id}/status`, { isActive }),
  updateTeamMemberOrder: (id, displayOrder) => axiosInstance.patch(`/team-members/admin/${id}/order`, { displayOrder }),
  getTeamMemberStats: () => axiosInstance.get('/team-members/admin/stats'),

  // Tickets - Admin Routes
  getTickets: (params) => axiosInstance.get('/tickets', { params }),
  getTicketById: (id) => axiosInstance.get(`/tickets/${id}`),
  createTicket: (data) => axiosInstance.post('/tickets', data),
  updateTicket: (id, data) => axiosInstance.patch(`/tickets/${id}`, data),
  addTicketComment: (id, data) => axiosInstance.post(`/tickets/${id}/comments`, data),

  // Documents - Admin Routes
  getDocuments: (params) => axiosInstance.get('/documents/admin', { params }),
  getDocumentById: (id) => axiosInstance.get(`/documents/admin/${id}`),
  createDocument: (formData) => {
    // Let browser set Content-Type automatically for multipart/form-data
    // This ensures the boundary parameter is set correctly
    return axiosInstance.post('/documents/admin', formData, {
      headers: {
        'Content-Type': undefined // This tells axios to let the browser set it
      },
      transformRequest: [(data) => data] // Don't transform the FormData
    });
  },
  updateDocument: (id, data) => axiosInstance.put(`/documents/admin/${id}`, data),
  uploadNewVersion: (id, formData) => axiosInstance.post(`/documents/admin/${id}/version`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => axiosInstance.delete(`/documents/admin/${id}`),
  downloadDocument: (id) => axiosInstance.get(`/documents/admin/${id}/download`),
  getDocumentStats: () => axiosInstance.get('/documents/admin/stats'),
  getDocumentCategories: () => axiosInstance.get('/documents/admin/categories'),
  getDocumentFileTypes: () => axiosInstance.get('/documents/admin/file-types'),

  // Hero - Admin Routes
  getHeroStats: () => axiosInstance.get('/hero/admin/stats'),
  getHeros: (params) => axiosInstance.get('/hero/admin', { params }),
  getHeroById: (id) => axiosInstance.get(`/hero/admin/${id}`),
  createHero: (data) => axiosInstance.post('/hero/admin', data),
  updateHero: (id, data) => axiosInstance.put(`/hero/admin/${id}`, data),
  deleteHero: (id) => axiosInstance.delete(`/hero/admin/${id}`),
  uploadHeroVideo: (id, formData) => axiosInstance.post(`/hero/admin/${id}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadHeroImage: (id, formData) => axiosInstance.post(`/hero/admin/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteHeroMedia: (id, type) => axiosInstance.delete(`/hero/admin/${id}/media/${type}`),
  setActiveHero: (id) => axiosInstance.patch(`/hero/admin/${id}/activate`),

  // Payments & Feature Access
  createPaymentRequest: (formData) => axiosInstance.post('/payments/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAdminPaymentStatus: (featureKey) => axiosInstance.get(`/payments/admin/${featureKey}`),
  getFeatureAccessStatus: (featureKey) => axiosInstance.get(`/feature-access/${featureKey}`),
  startFeatureDemo: (featureKey, durationMinutes = 1440) => axiosInstance.post(`/feature-access/${featureKey}/demo/start`, { durationMinutes }),
  getFeatureDemoStatus: (featureKey) => axiosInstance.get(`/feature-access/${featureKey}/demo/status`),
}

export default apiService

