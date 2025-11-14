import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Claim } from '@/types/claim.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS as ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type alias for claim data used in create operations
 * Excludes auto-generated fields: id, createdAt, updatedAt
 */
type CreateClaimData = Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type alias for claim data used in update operations
 * All fields are optional since updates can be partial
 */
type UpdateClaimData = Partial<Claim>;

/**
 * Parameters for update claim mutation
 */
type UpdateClaimParams = {
  id: number;
  data: UpdateClaimData;
};

/**
 * Claim API Service - Handles all HTTP operations for claims
 */
export const claimApi = {
  /**
   * Fetch all claims for the current user
   * @returns Promise that resolves to array of claims
   */
  getUserClaims: (): Promise<Claim[]> => 
    apiFetch<Claim[]>(ENDPOINTS.CLAIM),
    
  /**
   * Fetch a specific claim by ID
   * @param id - The unique identifier of the claim
   * @returns Promise that resolves to the claim data
   */
  getClaimById: (id: number): Promise<Claim> => 
    apiFetch<Claim>(`${ENDPOINTS.CLAIM}/${id}`),
    
  /**
   * Create a new claim
   * @param data - Claim data without auto-generated fields
   * @returns Promise that resolves to the created claim
   */
  createClaim: (data: CreateClaimData): Promise<Claim> => 
    apiFetch<Claim>(ENDPOINTS.CLAIM, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    }),
    
  /**
   * Update an existing claim
   * @param id - The unique identifier of the claim to update
   * @param data - Partial claim data to update
   * @returns Promise that resolves to the updated claim
   */
  updateClaim: (id: number, data: UpdateClaimData): Promise<Claim> => 
    apiFetch<Claim>(`${ENDPOINTS.CLAIM}/${id}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    }),
    
  /**
   * Delete a claim
   * @param id - The unique identifier of the claim to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteClaim: (id: number): Promise<void> => 
    apiFetch<void>(`${ENDPOINTS.CLAIM}/${id}`, {
      method: HTTP_METHODS.DELETE,
    }),
};

/**
 * React Query Hook: Fetch all user claims
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with claim data and loading states
 */
export const useUserClaims = (queryOptions?: UseQueryOptions<Claim[]> | undefined) => 
  useQuery<Claim[]>({
    queryKey: queryKeys.claims.list(),
    queryFn: claimApi.getUserClaims,
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Fetch a specific claim by ID
 * @param id - The unique identifier of the claim
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with claim data and loading states
 */
export const useClaimById = (id: number, queryOptions?: UseQueryOptions<Claim> | undefined) => 
  useQuery<Claim>({
    queryKey: queryKeys.claims.detail(id),
    queryFn: () => claimApi.getClaimById(id),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Create a new claim
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateClaim = (mutationOptions?: UseMutationOptions<Claim, Error, CreateClaimData> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Claim, Error, CreateClaimData>({
    mutationFn: claimApi.createClaim,
    onSuccess: (data: Claim, variables: CreateClaimData, context: unknown, mutation: any) => {
      // Invalidate claims list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Update an existing claim
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateClaim = (mutationOptions?: UseMutationOptions<Claim, Error, UpdateClaimParams> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Claim, Error, UpdateClaimParams>({
    mutationFn: (params: UpdateClaimParams): Promise<Claim> => 
      claimApi.updateClaim(params.id, params.data),
    onSuccess: (data: Claim, variables: UpdateClaimParams, context: unknown, mutation: any) => {
      // Invalidate claims list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      
      // Update the specific claim in cache for immediate UI update
      queryClient.setQueryData(
        queryKeys.claims.detail(variables.id), 
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
 * React Query Hook: Delete a claim
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteClaim = (mutationOptions?: UseMutationOptions<void, Error, number> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: claimApi.deleteClaim,
    onSuccess: (data: void, variables: number, context: unknown, mutation: any) => {
      // Invalidate claims list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.list() });
      
      // Remove the specific claim from cache
      queryClient.removeQueries({ queryKey: queryKeys.claims.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
