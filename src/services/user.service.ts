import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User } from '@/types/user.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS as ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type alias for user data used in update operations
 * All fields are optional since updates can be partial
 */
type UpdateUserData = Partial<User>;

/**
 * Parameters for update user mutation
 */
type UpdateUserParams = {
  id: number;
  data: UpdateUserData;
};

/**
 * User API Service - Handles all HTTP operations for users
 */
export const userApi = {
  /**
   * Fetch current user information
   * @returns Promise that resolves to the current user data
   */
  getCurrentUser: (): Promise<User> => 
    apiFetch<User>(ENDPOINTS.USER),
    
  /**
   * Create a new user
   * @returns Promise that resolves to the created user
   */
  createUser: (): Promise<User> => 
    apiFetch<User>(ENDPOINTS.USER, {
      method: HTTP_METHODS.POST,
    }),
    
  /**
   * Update current user information
   * @param data - Partial user data to update
   * @returns Promise that resolves to the updated user
   */
  updateUser: (data: UpdateUserData): Promise<User> => 
    apiFetch<User>(ENDPOINTS.USER, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    }),
    
  /**
   * Fetch all users (admin operation)
   * @returns Promise that resolves to array of all users
   */
  getAllUsers: (): Promise<User[]> => 
    apiFetch<User[]>(`${ENDPOINTS.USER}${ENDPOINTS.ADMIN_PATH}/all`),
    
  /**
   * Fetch a specific user by ID (admin operation)
   * @param id - The unique identifier of the user
   * @returns Promise that resolves to the user data
   */
  getUserById: (id: number): Promise<User> => 
    apiFetch<User>(`${ENDPOINTS.USER}${ENDPOINTS.ADMIN_PATH}/${id}`),
    
  /**
   * Update a specific user by ID (admin operation)
   * @param id - The unique identifier of the user to update
   * @param data - Partial user data to update
   * @returns Promise that resolves to the updated user
   */
  updateUserById: (id: number, data: UpdateUserData): Promise<User> => 
    apiFetch<User>(`${ENDPOINTS.USER}${ENDPOINTS.ADMIN_PATH}/${id}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    }),
    
  /**
   * Delete a user by ID (admin operation)
   * @param id - The unique identifier of the user to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteUserById: (id: number): Promise<void> => 
    apiFetch<void>(`${ENDPOINTS.USER}${ENDPOINTS.ADMIN_PATH}/${id}`, {
      method: HTTP_METHODS.DELETE,
    }),
};

/**
 * React Query Hook: Fetch current user
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with user data and loading states
 */
export const useCurrentUser = (queryOptions?: UseQueryOptions<User> | undefined) => 
  useQuery<User>({
    queryKey: queryKeys.users.current(),
    queryFn: userApi.getCurrentUser,
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Create a new user
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateUser = (mutationOptions?: UseMutationOptions<User, Error, void> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<User, Error, void>({
    mutationFn: userApi.createUser,
    onSuccess: (data, variables, context, mutation) => {
      // Update current user in cache for immediate UI update
      queryClient.setQueryData(queryKeys.users.current(), data);
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Update current user
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateUser = (mutationOptions?: UseMutationOptions<User, Error, UpdateUserData> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<User, Error, UpdateUserData>({
    mutationFn: userApi.updateUser,
    onSuccess: (data, variables, context, mutation) => {
      // Update current user in cache for immediate UI update
      queryClient.setQueryData(queryKeys.users.current(), data);
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Fetch all users (admin)
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with users data and loading states
 */
export const useAllUsers = (queryOptions?: UseQueryOptions<User[]> | undefined) => 
  useQuery<User[]>({
    queryKey: queryKeys.users.admin.list(),
    queryFn: userApi.getAllUsers,
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Fetch a specific user by ID (admin)
 * @param id - The unique identifier of the user
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with user data and loading states
 */
export const useUserById = (id: number, queryOptions?: UseQueryOptions<User> | undefined) => 
  useQuery<User>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Update a specific user by ID (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateUserById = (mutationOptions?: UseMutationOptions<User, Error, UpdateUserParams> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<User, Error, UpdateUserParams>({
    mutationFn: userApi.updateUserById,
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate users list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      
      // Update specific user in cache for immediate UI update
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Delete a user by ID (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteUserById = (mutationOptions?: UseMutationOptions<void, Error, number> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: userApi.deleteUserById,
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate users list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      
      // Remove specific user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
