import { apiClient } from '../client';
import { AdminStats } from '../../types/admin';

export const dashboardApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>('/api/v1/admin/stats');
    return response.data;
  },
};

