import { apiClient } from './client';
import type {
  ChatSession,
  ChatSessionDetail,
  ChatMessageRequest,
  ChatMessageSendResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const chatApi = {
  sendMessage: async (
    data: ChatMessageRequest,
    callbacks: {
      onChunk: (content: string) => void;
      onComplete: (response: ChatMessageSendResponse) => void;
      onError: (error: string) => void;
    }
  ): Promise<void> => {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '메시지 전송에 실패했습니다.');
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        // 마지막 조각은 다음 청크와 합쳐질 수 있으므로 buffer에 남김
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === 'chunk') {
                callbacks.onChunk(parsed.content);
              } else if (parsed.type === 'done') {
                callbacks.onComplete(parsed);
              } else if (parsed.type === 'error') {
                callbacks.onError(parsed.detail);
              }
            } catch (e) {
              console.error('SSE Parsing Error:', e, 'JSON String:', jsonStr);
            }
          }
        }
      }
    } catch (error) {
      callbacks.onError(error instanceof Error ? error.message : '알 수 없는 오류');
    }
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
