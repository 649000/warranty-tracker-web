import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Warranty } from '@/types/warranty.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS as ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type alias for warranty data used in create operations
 * Includes all fields except auto-generated ones
 */
type CreateWarrantyData = Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type alias for warranty data used in update operations
 * All fields are optional since updates can be partial
 */
type UpdateWarrantyData = Partial<Warranty>;

/**
 * Parameters for update warranty mutation
 */
type UpdateWarrantyParams = {
  id: number;
  data: UpdateWarrantyData;
};

/**
 * Warranty API Service - Handles all HTTP operations for warranties
 */
export const warrantyApi = {
  /**
   * Fetch all warranties
   * @returns Promise that resolves to array of warranties
   */
  getAllWarranties: function(): Promise<Warranty[]> {
    return apiFetch<Warranty[]>(ENDPOINTS.WARRANTY);
  },

  /**
   * Fetch a specific warranty by ID
   * @param id - The unique identifier of the warranty
   * @returns Promise that resolves to the warranty data
   */
  getWarrantyById: function(id: number): Promise<Warranty> {
    if (id === undefined || id === null) {
      throw new Error('Warranty ID is required');
    }
    return apiFetch<Warranty>(`${ENDPOINTS.WARRANTY}/${id}`);
  },

  /**
   * Create a new warranty
   * @param data - Warranty data without auto-generated fields
   * @returns Promise that resolves to the created warranty
   */
  createWarranty: function(data: CreateWarrantyData): Promise<Warranty> {
    if (!data) {
      throw new Error('Warranty data is required');
    }
    return apiFetch<Warranty>(ENDPOINTS.WARRANTY, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing warranty
   * @param id - The unique identifier of the warranty to update
   * @param data - Partial warranty data to update
   * @returns Promise that resolves to the updated warranty
   */
  updateWarranty: function(id: number, data: UpdateWarrantyData): Promise<Warranty> {
    if (id === undefined || id === null) {
      throw new Error('Warranty ID is required');
    }
    if (!data) {
      throw new Error('Update data is required');
    }
    return apiFetch<Warranty>(`${ENDPOINTS.WARRANTY}/${id}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a warranty
   * @param id - The unique identifier of the warranty to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteWarranty: function(id: number): Promise<void> {
    if (id === undefined || id === null) {
      throw new Error('Warranty ID is required');
    }
    return apiFetch<void>(`${ENDPOINTS.WARRANTY}/${id}`, {
      method: HTTP_METHODS.DELETE,
    });
  },
};

/**
 * React Query Hook: Fetch all warranties
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with warranty data and loading states
 */
export const useAllWarranties = function(queryOptions?: UseQueryOptions<Warranty[]> | undefined) {
  return useQuery<Warranty[]>({
    queryKey: queryKeys.warranties.list(),
    queryFn: warrantyApi.getAllWarranties,
    ...(queryOptions || {}),
  });
};

/**
 * React Query Hook: Fetch a specific warranty by ID
 * @param id - The unique identifier of the warranty
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with warranty data and loading states
 */
export const useWarrantyById = function(id: number, queryOptions?: UseQueryOptions<Warranty> | undefined) {
  if (id === undefined || id === null) {
    throw new Error('Warranty ID is required');
  }
  
  return useQuery<Warranty>({
    queryKey: queryKeys.warranties.detail(id),
    queryFn: function(): Promise<Warranty> {
      return warrantyApi.getWarrantyById(id);
    },
    ...(queryOptions || {}),
  });
};

/**
 * React Query Hook: Create a new warranty
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateWarranty = function(mutationOptions?: UseMutationOptions<Warranty, Error, CreateWarrantyData> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Warranty, Error, CreateWarrantyData>({
    mutationFn: warrantyApi.createWarranty,
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate warranties list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Update an existing warranty
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateWarranty = function(mutationOptions?: UseMutationOptions<Warranty, Error, UpdateWarrantyParams> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Warranty, Error, UpdateWarrantyParams>({
    mutationFn: function(params: UpdateWarrantyParams): Promise<Warranty> {
      return warrantyApi.updateWarranty(params.id, params.data);
    },
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate warranties list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      
      // Update the specific warranty in cache for immediate UI update
      queryClient.setQueryData(
        queryKeys.warranties.detail(variables.id), 
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
 * React Query Hook: Delete a warranty
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteWarranty = function(mutationOptions?: UseMutationOptions<void, Error, number> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: warrantyApi.deleteWarranty,
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate warranties list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.list() });
      
      // Remove the specific warranty from cache
      queryClient.removeQueries({ queryKey: queryKeys.warranties.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
