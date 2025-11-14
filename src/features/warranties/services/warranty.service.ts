import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Warranty } from '@/types/warranty.types';
import { apiFetch, queryKeys } from './api.base';

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

// React Query Hooks
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
