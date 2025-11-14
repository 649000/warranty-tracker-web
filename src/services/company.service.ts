import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Company } from '@/types/company.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS as ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type alias for company data used in create operations
 * Only the name field is required for creation
 */
type CreateCompanyData = Pick<Company, 'name'>;

/**
 * Type alias for company data used in update operations
 * All fields are optional since updates can be partial
 */
type UpdateCompanyData = Pick<Company, 'name'>;

/**
 * Parameters for update company mutation
 */
type UpdateCompanyParams = {
  id: number;
  data: UpdateCompanyData;
};

/**
 * Company API Service - Handles all HTTP operations for companies
 */
export const companyApi = {
  /**
   * Fetch all companies
   * @returns Promise that resolves to array of companies
   */
  getAllCompanies: (): Promise<Company[]> => apiFetch<Company[]>(ENDPOINTS.COMPANY),

  /**
   * Fetch a specific company by ID
   * @param id - The unique identifier of the company
   * @returns Promise that resolves to the company data
   */
  getCompanyById: (id: number): Promise<Company> => apiFetch<Company>(`${ENDPOINTS.COMPANY}/${id}`),

  /**
   * Search companies by name
   * @param name - The name to search for (partial match)
   * @returns Promise that resolves to array of matching companies
   */
  searchCompanies: (name: string): Promise<Company[]> => apiFetch<Company[]>(`${ENDPOINTS.COMPANY}/search?name=${name}`),

  /**
   * Create a new company (admin operation)
   * @param data - Company data (name only)
   * @returns Promise that resolves to the created company
   */
  createCompany: (data: CreateCompanyData): Promise<Company> => apiFetch<Company>(`${ENDPOINTS.COMPANY}${ENDPOINTS.ADMIN_PATH}`, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(data),
  }),

  /**
   * Update an existing company (admin operation)
   * @param id - The unique identifier of the company to update
   * @param data - Company data to update
   * @returns Promise that resolves to the updated company
   */
  updateCompany: (id: number, data: UpdateCompanyData): Promise<Company> => apiFetch<Company>(`${ENDPOINTS.COMPANY}${ENDPOINTS.ADMIN_PATH}/${id}`, {
    method: HTTP_METHODS.PUT,
    body: JSON.stringify(data),
  }),

  /**
   * Delete a company (admin operation)
   * @param id - The unique identifier of the company to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteCompany: (id: number): Promise<void> => apiFetch<void>(`${ENDPOINTS.COMPANY}${ENDPOINTS.ADMIN_PATH}/${id}`, {
    method: HTTP_METHODS.DELETE,
  }),
};

/**
 * React Query Hook: Fetch all companies
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with company data and loading states
 */
export const useAllCompanies = (queryOptions?: UseQueryOptions<Company[]> | undefined) => 
  useQuery<Company[]>({
    queryKey: queryKeys.companies.list(),
    queryFn: companyApi.getAllCompanies,
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Fetch a specific company by ID
 * @param id - The unique identifier of the company
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with company data and loading states
 */
export const useCompanyById = (id: number, queryOptions?: UseQueryOptions<Company> | undefined) => 
  useQuery<Company>({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companyApi.getCompanyById(id),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Search companies by name
 * @param name - The name to search for (partial match)
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with matching companies and loading states
 */
export const useSearchCompanies = (name: string, queryOptions?: UseQueryOptions<Company[]> | undefined) => 
  useQuery<Company[]>({
    queryKey: queryKeys.companies.search(name),
    queryFn: () => companyApi.searchCompanies(name),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Create a new company (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateCompany = (mutationOptions?: UseMutationOptions<Company, Error, CreateCompanyData> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Company, Error, CreateCompanyData>({
    mutationFn: companyApi.createCompany,
    onSuccess: (data: Company, variables: CreateCompanyData, context: unknown, mutation: any) => {
      // Invalidate companies list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Update an existing company (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateCompany = (mutationOptions?: UseMutationOptions<Company, Error, UpdateCompanyParams> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Company, Error, UpdateCompanyParams>({
    mutationFn: (params: UpdateCompanyParams): Promise<Company> => 
      companyApi.updateCompany(params.id, params.data),
    onSuccess: (data: Company, variables: UpdateCompanyParams, context: unknown, mutation: any) => {
      // Invalidate companies list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      
      // Update the specific company in cache for immediate UI update
      queryClient.setQueryData(
        queryKeys.companies.detail(variables.id), 
        data
      );
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Delete a company (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteCompany = (mutationOptions?: UseMutationOptions<void, Error, number> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: companyApi.deleteCompany,
    onSuccess: (data: void, variables: number, context: unknown, mutation: any) => {
      // Invalidate companies list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      
      // Remove the specific company from cache
      queryClient.removeQueries({ queryKey: queryKeys.companies.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
