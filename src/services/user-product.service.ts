import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { UserProduct } from '@/types/user-product.types';
import { apiFetch, queryKeys } from '@/lib/api.base';

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

// React Query Hooks
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
