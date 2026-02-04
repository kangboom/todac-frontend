import { apiClient as client } from '../client';

export interface AdminFeedback {
  id: string;
  score: number;
  comment: string | null;
  created_at: string;
  message_id: string;
  answer: string;
  question: string | null;
  session_id: string;
  user_email: string | null;
  user_nickname: string | null;
}

export interface FeedbackListResponse {
  items: AdminFeedback[];
  total: number;
  page: number;
  size: number;
}

export const feedbackApi = {
  getFeedbackList: async (skip = 0, limit = 10) => {
    const response = await client.get<FeedbackListResponse>(`/api/v1/admin/feedback/?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};
