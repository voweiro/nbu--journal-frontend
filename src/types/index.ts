// User Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  REVIEWER = 'reviewer',
  PUBLISHER = 'publisher'
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  role: UserRole;
  department?: string;
  created_at: string;
  is_email_verified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isResendLoading: boolean;
  error: string | null;
}

// Journal Types
export enum JournalStatus {
  SUBMITTED = 'submitted',
  RECEIVED = 'received',
  ASSIGNED = 'assigned',
  BEING_REVIEWED = 'being_reviewed',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected'
}

export interface JournalAuthor {
  id: number;
  journal_id: number;
  author_name: string;
  author_email?: string;
  author_department?: string;
  is_primary: boolean;
  created_at: string;
}

export interface Journal {
  id: number;
  title: string;
  abstract: string;
  publisher_id: number;
  reviewer_id?: number;
  file_path: string;
  status: JournalStatus | string;
  created_at: string;
  updated_at: string;
  published_date?: string;
  publication_number?: string;
  publisher_first_name?: string;
  publisher_last_name?: string;
  publisher_profile_picture?: string;
  reviewer_first_name?: string;
  reviewer_last_name?: string;
  authors?: JournalAuthor[];
  reviews?: JournalReview[];
  author_names?: string; // Added for display purposes
}

export interface JournalReview {
  id: number;
  journal_id: number;
  reviewer_id: number;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  reviewed_at: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

export interface JournalSubmission {
  title: string;
  abstract: string;
  authors: {
    name: string;
    email?: string;
    department?: string;
    isPrimary: boolean;
  }[];
  journalFile: File;
}

// Filter Types
export interface JournalFilters {
  sort_by?: 'title' | 'published_date' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
  search?: string;
  limit?: number;
  page?: number;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

// Filter Types
export interface JournalFilters {
  status?: JournalStatus;
  sort_by?: 'title' | 'created_at' | 'published_date';
  sort_order?: 'ASC' | 'DESC';
}
