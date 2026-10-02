export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ScholarshipFilterParams {
  search?: string;
  category?: string;
  education_level?: string;
  discipline?: string;
  country?: string;
  state?: string;
  min_funding?: number;
  max_funding?: number;
  status?: string;
  application_status?: 'open' | 'closing_soon' | 'upcoming' | 'closed';
  sort_by?: 'latest' | 'deadline' | 'funding_high' | 'funding_low' | 'relevance';
  page?: number;
  pageSize?: number;
}
