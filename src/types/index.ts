export type UserRole = 'ADMIN' | 'REP' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  brandCount: number;
  createdAt: string;
}

export interface BrandCategory {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  externalLink: string;
  categories?: BrandCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductLink {
  id: string;
  url: string;
  name: string;
}

export interface QuoteItem {
  id: string;
  productUrl: string;
  productName: string;
  quantity: number | null;
}

export interface QuoteResponse {
  id: string;
  quoteUrl: string | null;
  invoiceUrl: string | null;
  trackingUrl: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export type QuoteRequestStatus = 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteRequest {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  items: QuoteItem[];
  status: QuoteRequestStatus;
  response: QuoteResponse | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  respondedAt: string | null;
}

export interface DashboardMetrics {
  totalQuoteRequests: number;
  pendingQuoteRequests: number;
  quotedQuoteRequests: number;
  expiredQuoteRequests: number;
  totalBrands: number;
  totalClients: number;
  recentQuoteRequests: QuoteRequest[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
