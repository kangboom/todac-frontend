import { apiClient } from './client';
import type { Baby, BabyCreateRequest, BabyUpdateRequest } from '../types';

export const babyApi = {
  create: async (data: BabyCreateRequest): Promise<Baby> => {
    const response = await apiClient.post<Baby>('/api/v1/babies', data);
    return response.data;
  },

  getAll: async (): Promise<Baby[]> => {
    const response = await apiClient.get<Baby[]>('/api/v1/babies');
    return response.data;
  },

  getById: async (babyId: string): Promise<Baby> => {
    const response = await apiClient.get<Baby>(`/api/v1/babies/${babyId}`);
    return response.data;
  },

  update: async (babyId: string, data: BabyUpdateRequest): Promise<Baby> => {
    const response = await apiClient.put<Baby>(`/api/v1/babies/${babyId}`, data);
    return response.data;
  },

  delete: async (babyId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/babies/${babyId}`);
  },
};














