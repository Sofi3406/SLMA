import api from './api';

export const adminApi = {
  listUsers: async (page = 1, limit = 20, search = '') => {
    const res = await api.get('/admin/users', { params: { page, limit, search } });
    return res.data;
  },

  createUser: async (payload: any) => {
    const res = await api.post('/admin/users', payload);
    return res.data;
  },

  changeRole: async (id: string, role: string) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  setStatus: async (id: string, isActive: boolean) => {
    const res = await api.put(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  verifyUser: async (id: string) => {
    const res = await api.put(`/admin/users/${id}/verify`);
    return res.data;
  },

  getPayments: async (status?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const res = await api.get('/admin/payments', { params });
    return res.data;
  },

  verifyPayment: async (userId: string, status: 'verified' | 'rejected', notes?: string) => {
    const res = await api.put(`/admin/payments/${userId}/verify`, { status, notes });
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard/stats', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    });
    return res.data;
  }
};

export default adminApi;
