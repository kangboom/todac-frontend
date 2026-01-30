import { apiClient } from './client';
import type {
  ChatSession,
  ChatSessionDetail,
  ChatMessageRequest,
  ChatMessageSendResponse,
} from '../types';

export const chatApi = {
  sendMessage: async (data: ChatMessageRequest): Promise<ChatMessageSendResponse> => {
    const response = await apiClient.post<ChatMessageSendResponse>(
      '/api/v1/chat/message',
      data
    );
    return response.data;
  },

  getSessions: async (babyId?: string): Promise<ChatSession[]> => {
    const url = babyId 
      ? `/api/v1/chat/sessions?baby_id=${babyId}`
      : '/api/v1/chat/sessions';
    const response = await apiClient.get<ChatSession[]>(url);
    return response.data;
  },

  getSessionDetail: async (sessionId: string): Promise<ChatSessionDetail> => {
    const response = await apiClient.get<ChatSessionDetail>(
      `/api/v1/chat/sessions/${sessionId}`
    );
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/chat/sessions/${sessionId}`);
  },

  sendFeedback: async (messageId: string, score: number, comment?: string): Promise<void> => {
    await apiClient.post('/api/v1/feedback', {
      message_id: messageId,
      score,
      comment,
    });
  },
};


