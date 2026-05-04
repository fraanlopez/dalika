import apiClient from './api';
import { delay } from '@/utils';
import {
  MOCK_CREDENTIALS,
  MOCK_USERS,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_QUOTE_REQUESTS,
  MOCK_METRICS_ADMIN,
  MOCK_METRICS_CLIENT,
  MOCK_METRICS_REP,
} from '@/data/mock';
import type {
  User,
  LoginCredentials,
  AuthTokens,
  Brand,
  Category,
  QuoteRequest,
  DashboardMetrics,
  UserRole,
  PaginatedResponse,
} from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let mockUsers = [...MOCK_USERS];
let mockBrands = [...MOCK_BRANDS];
let mockCategories = [...MOCK_CATEGORIES];
let mockQuoteRequests = [...MOCK_QUOTE_REQUESTS];

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    if (USE_MOCK) {
      await delay(800);
      const entry = MOCK_CREDENTIALS[credentials.email];
      if (!entry || entry.password !== credentials.password) {
        throw { message: 'Email o contraseña incorrectos', status: 401 };
      }
      const tokens: AuthTokens = {
        accessToken: `mock-jwt-${entry.user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${entry.user.id}-${Date.now()}`,
        tokenType: 'Bearer',
      };
      return { user: entry.user, tokens };
    }

    const response = await apiClient.post('/v1/auth/login', credentials);
    return response.data.data;
  },

  async me(): Promise<User> {
    if (USE_MOCK) {
      await delay(300);
      const token = localStorage.getItem('accessToken') || '';
      const userId = token.split('-')[2];
      const user = mockUsers.find((u) => u.id === userId);
      if (!user) throw { message: 'Usuario no encontrado', status: 404 };
      return user;
    }

    const response = await apiClient.post('/v1/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      return;
    }

    await apiClient.post('/v1/auth/logout');
  },
};

export const usersService = {
  async getAll(params?: { page?: number; size?: number }): Promise<PaginatedResponse<User>> {
    if (USE_MOCK) {
      await delay(400);
      return {
        data: [...mockUsers],
        total: mockUsers.length,
        page: 0,
        size: mockUsers.length,
        totalPages: 1,
      };
    }

    const response = await apiClient.get('/v1/users', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<User> {
    if (USE_MOCK) {
      await delay(300);
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw { message: 'Usuario no encontrado', status: 404 };
      return { ...user };
    }

    const response = await apiClient.get(`/v1/users/${id}`);
    return response.data.data;
  },

  async create(data: { name: string; email: string; role: UserRole; password: string }): Promise<User> {
    if (USE_MOCK) {
      await delay(500);
      const exists = mockUsers.find((u) => u.email === data.email);
      if (exists) throw { message: 'El email ya esta registrado', status: 409 };

      const newUser: User = {
        id: generateId(),
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      mockUsers.push(newUser);
      return { ...newUser };
    }

    const response = await apiClient.post('/v1/users', data);
    return response.data.data;
  },

  async update(id: string, data: { name?: string; role?: UserRole; enabled?: boolean }): Promise<User> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index === -1) throw { message: 'Usuario no encontrado', status: 404 };

      mockUsers[index] = { ...mockUsers[index], ...data, id };
      return { ...mockUsers[index] };
    }

    const response = await apiClient.put(`/v1/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index === -1) throw { message: 'Usuario no encontrado', status: 404 };

      mockUsers[index] = { ...mockUsers[index], isActive: false };
      return;
    }

    await apiClient.delete(`/v1/users/${id}`);
  },
};

export const brandsService = {
  async getAll(params?: { page?: number; size?: number; activeOnly?: boolean }): Promise<PaginatedResponse<Brand>> {
    if (USE_MOCK) {
      await delay(400);
      let result = [...mockBrands];
      return {
        data: result,
        total: result.length,
        page: 0,
        size: result.length,
        totalPages: 1,
      };
    }

    const response = await apiClient.get('/v1/brands', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Brand> {
    if (USE_MOCK) {
      await delay(300);
      const brand = mockBrands.find((b) => b.id === id);
      if (!brand) throw { message: 'Marca no encontrada', status: 404 };
      return { ...brand };
    }

    const response = await apiClient.get(`/v1/brands/${id}`);
    return response.data.data;
  },

  async create(data: { name: string; description?: string; logoUrl?: string; externalLink?: string; categoryIds?: string[] }): Promise<Brand> {
    if (USE_MOCK) {
      await delay(500);
      const category = mockCategories.find((c) => c.id === data.categoryIds?.[0]);
      const newBrand: Brand = {
        id: generateId(),
        name: data.name,
        description: data.description || '',
        logoUrl: data.logoUrl || '',
        externalLink: data.externalLink || '',
        categories: category ? [{ id: category.id, name: category.name }] : [],
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      mockBrands.push(newBrand);
      return { ...newBrand };
    }

    const response = await apiClient.post('/v1/brands', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockBrands.findIndex((b) => b.id === id);
      if (index === -1) throw { message: 'Marca no encontrada', status: 404 };

      mockBrands[index] = { ...mockBrands[index], ...data, id };
      return { ...mockBrands[index] };
    }

    const response = await apiClient.put(`/v1/brands/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockBrands.findIndex((b) => b.id === id);
      if (index === -1) throw { message: 'Marca no encontrada', status: 404 };
      mockBrands.splice(index, 1);
      return;
    }

    await apiClient.delete(`/v1/brands/${id}`);
  },
};

export const categoriesService = {
  async getAll(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Category>> {
    if (USE_MOCK) {
      await delay(400);
      return {
        data: [...mockCategories],
        total: mockCategories.length,
        page: 0,
        size: mockCategories.length,
        totalPages: 1,
      };
    }

    const response = await apiClient.get('/v1/categories', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Category> {
    if (USE_MOCK) {
      await delay(300);
      const category = mockCategories.find((c) => c.id === id);
      if (!category) throw { message: 'Categoria no encontrada', status: 404 };
      return { ...category };
    }

    const response = await apiClient.get(`/v1/categories/${id}`);
    return response.data.data;
  },

  async create(data: { name: string; description?: string }): Promise<Category> {
    if (USE_MOCK) {
      await delay(500);
      const exists = mockCategories.find((c) => c.name.toLowerCase() === data.name.toLowerCase());
      if (exists) throw { message: 'La categoria ya existe', status: 409 };

      const newCategory: Category = {
        ...data,
        description: data.description || '',
        id: generateId(),
        brandCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockCategories.push(newCategory);
      return { ...newCategory };
    }

    const response = await apiClient.post('/v1/categories', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw { message: 'Categoria no encontrada', status: 404 };

      mockCategories[index] = { ...mockCategories[index], ...data, id };
      return { ...mockCategories[index] };
    }

    const response = await apiClient.put(`/v1/categories/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw { message: 'Categoria no encontrada', status: 404 };
      mockCategories.splice(index, 1);
      return;
    }

    await apiClient.delete(`/v1/categories/${id}`);
  },
};

export const quoteRequestsService = {
  async getAll(params?: { status?: string; page?: number; size?: number }): Promise<PaginatedResponse<QuoteRequest>> {
    if (USE_MOCK) {
      await delay(400);
      let result = [...mockQuoteRequests];

      if (params?.status) {
        result = result.filter((qr) => qr.status === params.status);
      }
      return {
        data: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        total: result.length,
        page: 0,
        size: result.length,
        totalPages: 1,
      };
    }

    const response = await apiClient.get('/v1/quote-requests', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<QuoteRequest> {
    if (USE_MOCK) {
      await delay(300);
      const qr = mockQuoteRequests.find((q) => q.id === id);
      if (!qr) throw { message: 'Solicitud de cotizacion no encontrada', status: 404 };
      return { ...qr };
    }

    const response = await apiClient.get(`/v1/quote-requests/${id}`);
    return response.data.data;
  },

  async create(data: {
    title: string;
    description: string;
    items: { productUrl: string; productName?: string; quantity?: number }[];
  }): Promise<QuoteRequest> {
    if (USE_MOCK) {
      await delay(600);
      const token = localStorage.getItem('accessToken') || '';
      const userId = token.split('-')[2];
      const user = mockUsers.find((u) => u.id === userId);

      const newQR: QuoteRequest = {
        id: `qr-${mockQuoteRequests.length + 1}`,
        clientId: userId,
        clientName: user?.name || 'Cliente',
        title: data.title,
        description: data.description,
        items: data.items.map((item, i) => ({
          id: `item-${generateId()}-${i}`,
          productUrl: item.productUrl,
          productName: item.productName || item.productUrl,
          quantity: item.quantity ?? null,
        })),
        status: 'PENDING',
        response: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: null,
        respondedAt: null,
      };
      mockQuoteRequests.push(newQR);
      return { ...newQR };
    }

    const response = await apiClient.post('/v1/quote-requests', data);
    return response.data.data;
  },

  async respond(id: string, data: { quoteUrl: string; adminNotes?: string }): Promise<QuoteRequest> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockQuoteRequests.findIndex((q) => q.id === id);
      if (index === -1) throw { message: 'Solicitud no encontrada', status: 404 };

      mockQuoteRequests[index] = {
        ...mockQuoteRequests[index],
        status: 'QUOTED',
        respondedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...mockQuoteRequests[index] };
    }

    const response = await apiClient.post(`/v1/quote-requests/${id}/response`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: string): Promise<QuoteRequest> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockQuoteRequests.findIndex((q) => q.id === id);
      if (index === -1) throw { message: 'Solicitud no encontrada', status: 404 };

      mockQuoteRequests[index] = {
        ...mockQuoteRequests[index],
        status: status as QuoteRequest['status'],
        updatedAt: new Date().toISOString(),
      };
      return { ...mockQuoteRequests[index] };
    }

    const response = await apiClient.patch(`/v1/quote-requests/${id}/status`, { status });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockQuoteRequests.findIndex((q) => q.id === id);
      if (index === -1) throw { message: 'Solicitud no encontrada', status: 404 };
      mockQuoteRequests.splice(index, 1);
      return;
    }

    await apiClient.delete(`/v1/quote-requests/${id}`);
  },
};

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    if (USE_MOCK) {
      await delay(500);
      const token = localStorage.getItem('accessToken') || '';
      const userId = token.split('-')[2];
      const user = mockUsers.find((u) => u.id === userId);

      if (user?.role === 'CLIENT') {
        return {
          ...MOCK_METRICS_CLIENT,
          recentQuoteRequests: MOCK_QUOTE_REQUESTS.filter(
            (qr) => qr.clientId === userId
          ).slice(0, 5),
        };
      }

      if (user?.role === 'REP') {
        return MOCK_METRICS_REP;
      }

      return MOCK_METRICS_ADMIN;
    }

    const response = await apiClient.get('/v1/dashboard/metrics');
    return response.data.data;
  },
};
