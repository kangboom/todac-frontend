import { apiClient as client } from '../client';

// ── Types ────────────────────────────────────────────────────────

export interface ChatUserSummary {
    user_id: string;
    email: string;
    nickname: string;
    total_sessions: number;
    total_messages: number;
    last_chat_at: string | null;
}

export interface ChatUserListResponse {
    items: ChatUserSummary[];
    total: number;
    page: number;
    size: number;
}

export interface ChatSessionSummary {
    session_id: string;
    title: string | null;
    started_at: string;
    updated_at: string;
    message_count: number;
}

export interface ChatSessionListResponse {
    items: ChatSessionSummary[];
    total: number;
}

export interface ChatMessageDetail {
    message_id: string;
    role: string;
    content: string;
    is_emergency: boolean;
    is_retry: boolean;
    rag_sources: any[] | null;
    created_at: string;
}

export interface ChatMessageListResponse {
    items: ChatMessageDetail[];
    total: number;
    session_title: string | null;
    user_nickname: string | null;
}

// ── API Functions ────────────────────────────────────────────────

export const chatHistoryApi = {
    getUsers: async (skip = 0, limit = 20, search?: string): Promise<ChatUserListResponse> => {
        const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
        if (search) params.set('search', search);
        const response = await client.get<ChatUserListResponse>(`/api/v1/admin/chat-history/users?${params}`);
        return response.data;
    },

    getUserSessions: async (userId: string): Promise<ChatSessionListResponse> => {
        const response = await client.get<ChatSessionListResponse>(`/api/v1/admin/chat-history/users/${userId}/sessions`);
        return response.data;
    },

    getSessionMessages: async (sessionId: string): Promise<ChatMessageListResponse> => {
        const response = await client.get<ChatMessageListResponse>(`/api/v1/admin/chat-history/sessions/${sessionId}/messages`);
        return response.data;
    },
};
