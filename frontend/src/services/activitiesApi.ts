import api from './api';

export const activitiesApi = {
  getUserActivities: async (limit = 10) => {
    const res = await api.get('/dashboard/activities', { params: { limit } });
    return res.data?.activities || [];
  },

  // Paginated activities for listing page
  getActivities: async (page = 1, limit = 20, type?: string) => {
    const params: any = { page, limit };
    if (type) params.type = type;
    const res = await api.get('/activities', { params });
    return res.data || { activities: [], pagination: {} };
  }
};

export default activitiesApi;
