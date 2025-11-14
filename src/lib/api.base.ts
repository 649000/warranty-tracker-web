// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Generic fetch helper
export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  
  return response.json();
};

// Query keys for caching
export const queryKeys = {
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    detail: (id: number) => [...queryKeys.users.all, id] as const,
    admin: {
      all: () => [...queryKeys.users.all, 'admin'] as const,
      list: () => [...queryKeys.users.admin.all(), 'list'] as const,
      detail: (id: number) => [...queryKeys.users.admin.all(), id] as const,
    }
  },
  companies: {
    all: ['companies'] as const,
    list: () => [...queryKeys.companies.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.companies.all, id] as const,
    search: (name: string) => [...queryKeys.companies.all, 'search', name] as const,
    admin: {
      all: () => [...queryKeys.companies.all, 'admin'] as const,
    }
  },
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.products.all, id] as const,
    search: (params: { name?: string; brand?: string; modelNumber?: string }) => 
      [...queryKeys.products.all, 'search', params] as const,
    admin: {
      all: () => [...queryKeys.products.all, 'admin'] as const,
    }
  },
  userProducts: {
    all: ['userProducts'] as const,
    list: () => [...queryKeys.userProducts.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.userProducts.all, id] as const,
    byProduct: (productId: number) => [...queryKeys.userProducts.all, 'byProduct', productId] as const,
  },
  warranties: {
    all: ['warranties'] as const,
    list: () => [...queryKeys.warranties.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.warranties.all, id] as const,
    byStatus: (status: string) => [...queryKeys.warranties.all, 'status', status] as const,
    expiring: (days: number) => [...queryKeys.warranties.all, 'expiring', days] as const,
    admin: {
      all: () => [...queryKeys.warranties.all, 'admin'] as const,
      list: () => [...queryKeys.warranties.admin.all(), 'list'] as const,
      byUser: (userId: number) => [...queryKeys.warranties.admin.all(), 'user', userId] as const,
      byCompany: (companyId: number) => [...queryKeys.warranties.admin.all(), 'company', companyId] as const,
      expired: () => [...queryKeys.warranties.admin.all(), 'expired'] as const,
      expiring: (startDate: string, endDate: string) => 
        [...queryKeys.warranties.admin.all(), 'expiring', startDate, endDate] as const,
    }
  },
  claims: {
    all: ['claims'] as const,
    list: () => [...queryKeys.claims.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.claims.all, id] as const,
  }
};
