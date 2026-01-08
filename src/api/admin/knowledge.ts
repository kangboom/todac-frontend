import { apiClient } from '../client';
import { KnowledgeListResponse, BatchDocumentResponse } from '../../types/knowledge';

export const adminApi = {
  // 지식 베이스 업로드 (여러 파일 지원)
  uploadKnowledge: async (files: File[], category: string): Promise<BatchDocumentResponse> => {
    const formData = new FormData();
    
    // 여러 파일 추가
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('category', category);

    const response = await apiClient.post<BatchDocumentResponse>('/api/v1/admin/knowledge/ingest', formData, {
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
