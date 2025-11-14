import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Company } from '@/types/company.types';
import { apiFetch, queryKeys } from '@/lib/api.base';

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

// React Query Hooks
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
