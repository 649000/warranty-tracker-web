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
