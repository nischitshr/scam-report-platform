export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface ScamFile {
  id: number;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface ScamReport {
  id: number;
  user_id: number;
  title: string;
  description: string;
  scam_type: 'phishing' | 'fake_job' | 'catfish' | 'investment' | 'shopping' | 'tech_support' | 'other';
  contact_used: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  report_count: number;
  evidence_file: string | null;
  submitted_by: string;
  files?: ScamFile[];
}

export interface PaginationInfo {
  page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
