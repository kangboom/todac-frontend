import { apiClient } from '../client';
import { KnowledgeDoc, KnowledgeListResponse } from '../../types/knowledge';

export const adminApi = {
  // 지식 베이스 업로드
  uploadKnowledge: async (file: File, category: string): Promise<KnowledgeDoc> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await apiClient.post<KnowledgeDoc>('/api/v1/admin/knowledge/ingest', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 지식 베이스 목록 조회
  getKnowledgeList: async (params?: { category?: string; limit?: number; offset?: number }): Promise<KnowledgeListResponse> => {
    const response = await apiClient.get<KnowledgeListResponse>('/api/v1/admin/knowledge/docs', {
      params,
    });
    return response.data;
  },

  // 지식 베이스 삭제
  deleteKnowledge: async (docId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/knowledge/docs/${docId}`);
  },
};
