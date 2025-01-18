export type DocumentCategory = 'Resume' | 'Recommendation Letter' | 'Motivation Letter' | 'Certificate' | 'Other';

export interface Document {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_path: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentLink {
  id: number;
  document_id: number;
  application_id?: number;
  task_id?: number;
  created_at: string;
}