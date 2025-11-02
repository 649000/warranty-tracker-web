import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Product } from '@/types/product.types';
import { apiFetch, queryKeys } from './api.base';

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

// React Query Hooks
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
