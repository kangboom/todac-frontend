export interface KnowledgeDoc {
  id: string;
  filename: string;
  storage_url: string;
  file_size: number;
  content_type: string;
  meta_info: {
    category: string;
    chunk_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface KnowledgeListResponse {
  documents: KnowledgeDoc[];
  total: number;
  limit: number;
  offset: number;
}

export interface BatchDocumentResult {
  success: boolean;
  filename: string;
  document: KnowledgeDoc | null;
  error: string | null;
}

export interface BatchDocumentResponse {
  results: BatchDocumentResult[];
  total: number;
  success_count: number;
  failure_count: number;
}

