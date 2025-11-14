import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User, Company, Product, UserProduct, Warranty, Claim } from '@/types/api.types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Generic fetch helper
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
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

// User API Service
export const userApi = {
  getCurrentUser: () => apiFetch<User>('/user'),
  createUser: () => apiFetch<User>('/user', { method: 'POST' }),
  updateUser: (data: Partial<User>) => apiFetch<User>('/user', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getAllUsers: () => apiFetch<User[]>('/user/admin/all'),
  getUserById: (id: number) => apiFetch<User>(`/user/admin/${id}`),
  updateUserById: (id: number, data: Partial<User>) => apiFetch<User>(`/user/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUserById: (id: number) => apiFetch<void>(`/user/admin/${id}`, {
    method: 'DELETE',
  }),
};

// Company API Service
export const companyApi = {
  getAllCompanies: () => apiFetch<Company[]>('/company'),
  getCompanyById: (id: number) => apiFetch<Company>(`/company/${id}`),
  searchCompanies: (name: string) => apiFetch<Company[]>(`/company/search?name=${name}`),
  createCompany: (data: Pick<Company, 'name'>) => apiFetch<Company>('/company/admin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCompany: (id: number, data: Pick<Company, 'name'>) => apiFetch<Company>(`/company/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCompany: (id: number) => apiFetch<void>(`/company/admin/${id}`, {
    method: 'DELETE',
  }),
};

// Product API Service
export const productApi = {
  getAllProducts: () => apiFetch<Product[]>('/product'),
  getProductById: (id: number) => apiFetch<Product>(`/product/${id}`),
  searchProducts: (params: { name?: string; brand?: string; modelNumber?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    return apiFetch<Product[]>(`/product/search?${queryParams.toString()}`);
  },
  createProduct: (data: Pick<Product, 'name' | 'modelNumber'>) => apiFetch<Product>('/product/admin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id: number, data: Partial<Product>) => apiFetch<Product>(`/product/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: number) => apiFetch<void>(`/product/admin/${id}`, {
    method: 'DELETE',
  }),
};

// User Product API Service
export const userProductApi = {
  getUserProducts: () => apiFetch<UserProduct[]>('/user-product'),
  getUserProductById: (id: number) => apiFetch<UserProduct>(`/user-product/${id}`),
  getUserProductsByProductId: (productId: number) => apiFetch<UserProduct[]>(`/user-product/product/${productId}`),
  createUserProduct: (data: Omit<UserProduct, 'id' | 'createdAt' | 'updatedAt' | 'user'>) => 
    apiFetch<UserProduct>('/user-product', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUserProduct: (id: number, data: Partial<UserProduct>) => 
    apiFetch<UserProduct>(`/user-product/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUserProduct: (id: number) => apiFetch<void>(`/user-product/${id}`, {
    method: 'DELETE',
  }),
};

// Warranty API Service
export const warrantyApi = {
  getUserWarranties: () => apiFetch<Warranty[]>('/warranty'),
  getWarrantyById: (id: number) => apiFetch<Warranty>(`/warranty/${id}`),
  getUserWarrantiesByStatus: (status: string) => apiFetch<Warranty[]>(`/warranty/status/${status}`),
  getUserExpiringWarranties: (days: number) => apiFetch<Warranty[]>(`/warranty/expiring?days=${days}`),
  createWarranty: (data: Omit<Warranty, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'user'>) => 
    apiFetch<Warranty>('/warranty', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWarranty: (id: number, data: Partial<Warranty>) => 
    apiFetch<Warranty>(`/warranty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteWarranty: (id: number) => apiFetch<void>(`/warranty/${id}`, {
    method: 'DELETE',
  }),
  // Admin endpoints
  getAllWarranties: () => apiFetch<Warranty[]>('/warranty/admin'),
  getWarrantiesByUserId: (userId: number) => apiFetch<Warranty[]>(`/warranty/admin/user/${userId}`),
  getWarrantiesByCompanyId: (companyId: number) => apiFetch<Warranty[]>(`/warranty/admin/company/${companyId}`),
  getExpiredWarranties: () => apiFetch<Warranty[]>('/warranty/admin/expired'),
  getExpiringWarranties: (startDate: string, endDate: string) => 
    apiFetch<Warranty[]>(`/warranty/admin/expiring?startDate=${startDate}&endDate=${endDate}`),
};

// Claim API Service
export const claimApi = {
  getUserClaims: () => apiFetch<Claim[]>('/claim'),
  getClaimById: (id: number) => apiFetch<Claim>(`/claim/${id}`),
  createClaim: (data: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiFetch<Claim>('/claim', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateClaim: (id: number, data: Partial<Claim>) => 
    apiFetch<Claim>(`/claim/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteClaim: (id: number) => apiFetch<void>(`/claim/${id}`, {
    method: 'DELETE',
  }),
};

// React Query Hooks
export const useCurrentUser = (options?: UseQueryOptions<User>) => 
  useQuery<User>({
    queryKey: queryKeys.users.current(),
    queryFn: userApi.getCurrentUser,
    ...options,
  });

export const useCreateUser = (options?: UseMutationOptions<User, Error, void>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, void>({
    mutationFn: userApi.createUser,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.current(), data);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

export const useUpdateUser = (options?: UseMutationOptions<User, Error, Partial<User>>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: userApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.current(), data);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

export const useAllUsers = (options?: UseQueryOptions<User[]>) => 
  useQuery<User[]>({
    queryKey: queryKeys.users.admin.list(),
    queryFn: userApi.getAllUsers,
    ...options,
  });

export const useUserById = (id: number, options?: UseQueryOptions<User>) => 
  useQuery<User>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    ...options,
  });

export const useUpdateUserById = (options?: UseMutationOptions<User, Error, { id: number; data: Partial<User> }>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: number; data: Partial<User> }>({
    mutationFn: ({ id, data }) => userApi.updateUserById(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteUserById = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: userApi.deleteUserById,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};

export const useAllCompanies = (options?: UseQueryOptions<Company[]>) => 
  useQuery<Company[]>({
    queryKey: queryKeys.companies.list(),
    queryFn: companyApi.getAllCompanies,
    ...options,
  });

export const useCompanyById = (id: number, options?: UseQueryOptions<Company>) => 
  useQuery<Company>({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companyApi.getCompanyById(id),
    ...options,
  });

export const useSearchCompanies = (name: string, options?: UseQueryOptions<Company[]>) => 
  useQuery<Company[]>({
    queryKey: queryKeys.companies.search(name),
    queryFn: () => companyApi.searchCompanies(name),
    ...options,
  });

export const useCreateCompany = (options?: UseMutationOptions<Company, Error, Pick<Company, 'name'>>) => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, Pick<Company, 'name'>>({
    mutationFn: companyApi.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      options?.onSuccess?.(undefined as any, undefined as any, undefined);
    },
    ...options,
  });
};

export const useUpdateCompany = (options?: UseMutationOptions<Company, Error, { id: number; data: Pick<Company, 'name'> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, { id: number; data: Pick<Company, 'name'> }>({
    mutationFn: ({ id, data }) => companyApi.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      queryClient.setQueryData(queryKeys.companies.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteCompany = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: companyApi.deleteCompany,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      queryClient.removeQueries({ queryKey: queryKeys.companies.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};

export const useAllProducts = (options?: UseQueryOptions<Product[]>) => 
  useQuery<Product[]>({
    queryKey: queryKeys.products.list(),
    queryFn: productApi.getAllProducts,
    ...options,
  });

export const useProductById = (id: number, options?: UseQueryOptions<Product>) => 
  useQuery<Product>({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.getProductById(id),
    ...options,
  });

export const useSearchProducts = (
  params: { name?: string; brand?: string; modelNumber?: string },
  options?: UseQueryOptions<Product[]>
) => 
  useQuery<Product[]>({
    queryKey: queryKeys.products.search(params),
    queryFn: () => productApi.searchProducts(params),
    ...options,
  });

export const useCreateProduct = (options?: UseMutationOptions<Product, Error, Pick<Product, 'name' | 'modelNumber'>>) => {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Pick<Product, 'name' | 'modelNumber'>>({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      options?.onSuccess?.(undefined as any, undefined as any, undefined);
    },
    ...options,
  });
};

export const useUpdateProduct = (options?: UseMutationOptions<Product, Error, { id: number; data: Partial<Product> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: number; data: Partial<Product> }>({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      queryClient.setQueryData(queryKeys.products.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteProduct = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: productApi.deleteProduct,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};

export const useUserProducts = (options?: UseQueryOptions<UserProduct[]>) => 
  useQuery<UserProduct[]>({
    queryKey: queryKeys.userProducts.list(),
    queryFn: userProductApi.getUserProducts,
    ...options,
  });

export const useUserProductById = (id: number, options?: UseQueryOptions<UserProduct>) => 
  useQuery<UserProduct>({
    queryKey: queryKeys.userProducts.detail(id),
    queryFn: () => userProductApi.getUserProductById(id),
    ...options,
  });

export const useUserProductsByProductId = (productId: number, options?: UseQueryOptions<UserProduct[]>) => 
  useQuery<UserProduct[]>({
    queryKey: queryKeys.userProducts.byProduct(productId),
    queryFn: () => userProductApi.getUserProductsByProductId(productId),
    ...options,
  });

export const useCreateUserProduct = (options?: UseMutationOptions<UserProduct, Error, Omit<UserProduct, 'id' | 'createdAt' | 'updatedAt' | 'user'>>) => {
  const queryClient = useQueryClient();
  return useMutation<UserProduct, Error, Omit<UserProduct, 'id' | 'createdAt' | 'updatedAt' | 'user'>>({
    mutationFn: userProductApi.createUserProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      options?.onSuccess?.(undefined as any, undefined as any, undefined);
    },
    ...options,
  });
};

export const useUpdateUserProduct = (options?: UseMutationOptions<UserProduct, Error, { id: number; data: Partial<UserProduct> }>) => {
  const queryClient = useQueryClient();
  return useMutation<UserProduct, Error, { id: number; data: Partial<UserProduct> }>({
    mutationFn: ({ id, data }) => userProductApi.updateUserProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      queryClient.setQueryData(queryKeys.userProducts.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteUserProduct = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: userProductApi.deleteUserProduct,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      queryClient.removeQueries({ queryKey: queryKeys.userProducts.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};

export const useUserWarranties = (options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.list(),
    queryFn: warrantyApi.getUserWarranties,
    ...options,
  });

export const useWarrantyById = (id: number, options?: UseQueryOptions<Warranty>) => 
  useQuery<Warranty>({
    queryKey: queryKeys.warranties.detail(id),
    queryFn: () => warrantyApi.getWarrantyById(id),
    ...options,
  });

export const useUserWarrantiesByStatus = (status: string, options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.byStatus(status),
    queryFn: () => warrantyApi.getUserWarrantiesByStatus(status),
    ...options,
  });

export const useUserExpiringWarranties = (days: number, options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.expiring(days),
    queryFn: () => warrantyApi.getUserExpiringWarranties(days),
    ...options,
  });

export const useCreateWarranty = (options?: UseMutationOptions<Warranty, Error, Omit<Warranty, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'user'>>) => {
  const queryClient = useQueryClient();
  return useMutation<Warranty, Error, Omit<Warranty, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'user'>>({
    mutationFn: warrantyApi.createWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      options?.onSuccess?.(undefined as any, undefined as any, undefined);
    },
    ...options,
  });
};

export const useUpdateWarranty = (options?: UseMutationOptions<Warranty, Error, { id: number; data: Partial<Warranty> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Warranty, Error, { id: number; data: Partial<Warranty> }>({
    mutationFn: ({ id, data }) => warrantyApi.updateWarranty(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      queryClient.setQueryData(queryKeys.warranties.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteWarranty = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: warrantyApi.deleteWarranty,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      queryClient.removeQueries({ queryKey: queryKeys.warranties.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};

export const useAllWarranties = (options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.admin.list(),
    queryFn: warrantyApi.getAllWarranties,
    ...options,
  });

export const useWarrantiesByUserId = (userId: number, options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.admin.byUser(userId),
    queryFn: () => warrantyApi.getWarrantiesByUserId(userId),
    ...options,
  });

export const useWarrantiesByCompanyId = (companyId: number, options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.admin.byCompany(companyId),
    queryFn: () => warrantyApi.getWarrantiesByCompanyId(companyId),
    ...options,
  });

export const useExpiredWarranties = (options?: UseQueryOptions<Warranty[]>) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.admin.expired(),
    queryFn: warrantyApi.getExpiredWarranties,
    ...options,
  });

export const useExpiringWarranties = (
  startDate: string, 
  endDate: string, 
  options?: UseQueryOptions<Warranty[]>
) => 
  useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.admin.expiring(startDate, endDate),
    queryFn: () => warrantyApi.getExpiringWarranties(startDate, endDate),
    ...options,
  });

export const useUserClaims = (options?: UseQueryOptions<Claim[]>) => 
  useQuery<Claim[]>({
    queryKey: queryKeys.claims.list(),
    queryFn: claimApi.getUserClaims,
    ...options,
  });

export const useClaimById = (id: number, options?: UseQueryOptions<Claim>) => 
  useQuery<Claim>({
    queryKey: queryKeys.claims.detail(id),
    queryFn: () => claimApi.getClaimById(id),
    ...options,
  });

export const useCreateClaim = (options?: UseMutationOptions<Claim, Error, Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const queryClient = useQueryClient();
  return useMutation<Claim, Error, Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: claimApi.createClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      options?.onSuccess?.(undefined as any, undefined as any, undefined);
    },
    ...options,
  });
};

export const useUpdateClaim = (options?: UseMutationOptions<Claim, Error, { id: number; data: Partial<Claim> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Claim, Error, { id: number; data: Partial<Claim> }>({
    mutationFn: ({ id, data }) => claimApi.updateClaim(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      queryClient.setQueryData(queryKeys.claims.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteClaim = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: claimApi.deleteClaim,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      queryClient.removeQueries({ queryKey: queryKeys.claims.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};
