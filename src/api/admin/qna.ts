import { apiClient as client } from '../client';

export interface QnA {
  id: number;
  question: string;
  answer: string;
  source: string;
  category: string;
  created_at?: string;
}

export interface QnAListResponse {
  items: QnA[];
  total: number;
  page: number;
  size: number;
}

export interface QnACreateRequest {
  question: string;
  answer: string;
  source: string;
  category: string;
}

export const qnaApi = {
  // QnA 등록
  createQnA: async (data: QnACreateRequest) => {
    const response = await client.post<QnA>('/api/v1/admin/qna/', data);
    return response.data;
  },

  // QnA 목록 조회
  getQnAList: async (skip = 0, limit = 10) => {
    const response = await client.get<QnAListResponse>(`/api/v1/admin/qna/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  // QnA 동기화
  syncQnA: async () => {
    const response = await client.post<{message: string, count: number}>('/api/v1/admin/qna/sync');
    return response.data;
  }
};
