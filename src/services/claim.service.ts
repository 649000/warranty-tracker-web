import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Claim } from '@/types/claim.types';
import { apiFetch, queryKeys } from '@/lib/api.base';

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
  const { onSuccess: userOnSuccess, ...restOptions } = options || {};
  return useMutation<Claim, Error, Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: claimApi.createClaim,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      userOnSuccess?.(data, variables, undefined);
    },
    ...restOptions,
  });
};

export const useUpdateClaim = (options?: UseMutationOptions<Claim, Error, { id: number; data: Partial<Claim> }>) => {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess, ...restOptions } = options || {};
  return useMutation<Claim, Error, { id: number; data: Partial<Claim> }>({
    mutationFn: ({ id, data }) => claimApi.updateClaim(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      queryClient.setQueryData(queryKeys.claims.detail(variables.id), data);
      userOnSuccess?.(data, variables, undefined);
    },
    ...restOptions,
  });
};

export const useDeleteClaim = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess, ...restOptions } = options || {};
  return useMutation<void, Error, number>({
    mutationFn: claimApi.deleteClaim,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      queryClient.removeQueries({ queryKey: queryKeys.claims.detail(variables) });
      userOnSuccess?.(data, variables, undefined);
    },
    ...restOptions,
  });
};
