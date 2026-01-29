export interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  created_at: string;
}

export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  due_date: string;
  gender: 'M' | 'F' | 'BOY' | 'GIRL' | null;
  birth_weight: number;
  birth_height?: number;
  medical_history: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  baby_id: string;
  title: string | null;
  is_active: boolean;
  started_at: string;
  updated_at: string;
  message_count?: number;
}

export interface RAGSource {
  doc_id: string;
  chunk_index: number;
  score: number;
  filename: string;
  category: string;
}

export interface ChatMessage {
  message_id: string;
  session_id: string;
  role: 'USER' | 'ASSISTANT';
  content: str;
  is_emergency: boolean;
  rag_sources?: RAGSource[];
  qna_sources?: RAGSource[];
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BabyCreateRequest {
  name: string;
  birth_date: string;
  due_date: string;
  gender?: 'M' | 'F' | 'BOY' | 'GIRL' | null;
  birth_weight: number;
  birth_height?: number;
  medical_history?: string[];
}

export interface BabyUpdateRequest {
  name?: string;
  birth_date?: string;
  due_date?: string;
  gender?: 'M' | 'F' | 'BOY' | 'GIRL' | null;
  birth_weight?: number;
  birth_height?: number;
  medical_history?: string[];
}

export interface ChatMessageRequest {
  baby_id: string;
  message: string;
  session_id?: string;
}

export interface ChatMessageSendResponse {
  response: string;
  session_id: string;
  is_emergency: boolean;
  rag_sources?: Array<Record<string, unknown>>;
  qna_sources?: Array<Record<string, unknown>>;
  response_time: number;
}
