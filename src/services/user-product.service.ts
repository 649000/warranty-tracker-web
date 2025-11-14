import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { UserProduct } from '@/types/user-product.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type aliases for better readability and maintainability
 */
type CreateUserProductData = Omit<UserProduct, 'id' | 'createdAt' | 'updatedAt' | 'user'>;
type UpdateUserProductData = Partial<UserProduct>;
type UpdateUserProductParams = { id: number; data: UpdateUserProductData };

/**
 * User Product API Service
 * Provides methods to interact with the user-product API endpoints
 */
export const userProductApi = {
  /**
   * Retrieves all user products
   * @returns Promise resolving to array of UserProduct objects
   */
  getUserProducts: function(): Promise<UserProduct[]> {
    return apiFetch<UserProduct[]>(API_ENDPOINTS.USER_PRODUCT);
  },

  /**
   * Retrieves a specific user product by ID
   * @param id - The ID of the user product to retrieve
   * @returns Promise resolving to UserProduct object
   */
  getUserProductById: function(id: number): Promise<UserProduct> {
    if (id === undefined || id === null) {
      throw new Error('User product ID is required');
    }
    return apiFetch<UserProduct>(`${API_ENDPOINTS.USER_PRODUCT}/${id}`);
  },

  /**
   * Retrieves all user products for a specific product
   * @param productId - The product ID to filter user products by
   * @returns Promise resolving to array of UserProduct objects
   */
  getUserProductsByProductId: function(productId: number): Promise<UserProduct[]> {
    if (productId === undefined || productId === null) {
      throw new Error('Product ID is required');
    }
    return apiFetch<UserProduct[]>(`${API_ENDPOINTS.USER_PRODUCT}/product/${productId}`);
  },

  /**
   * Creates a new user product
   * @param data - The user product data to create (excluding system-managed fields)
   * @returns Promise resolving to the created UserProduct object
   */
  createUserProduct: function(data: CreateUserProductData): Promise<UserProduct> {
    if (!data) {
      throw new Error('User product data is required');
    }
    return apiFetch<UserProduct>(API_ENDPOINTS.USER_PRODUCT, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates an existing user product
   * @param id - The ID of the user product to update
   * @param data - The partial user product data to update
   * @returns Promise resolving to the updated UserProduct object
   */
  updateUserProduct: function(id: number, data: UpdateUserProductData): Promise<UserProduct> {
    if (id === undefined || id === null) {
      throw new Error('User product ID is required');
    }
    if (!data) {
      throw new Error('Update data is required');
    }
    return apiFetch<UserProduct>(`${API_ENDPOINTS.USER_PRODUCT}/${id}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    });
  },

  /**
   * Deletes a user product
   * @param id - The ID of the user product to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteUserProduct: function(id: number): Promise<void> {
    if (id === undefined || id === null) {
      throw new Error('User product ID is required');
    }
    return apiFetch<void>(`${API_ENDPOINTS.USER_PRODUCT}/${id}`, {
      method: HTTP_METHODS.DELETE,
    });
  },
};

/**
 * React Query Hook for fetching all user products
 * @param options - Additional React Query options (optional)
 * @returns Query result with user products data
 */
export const useUserProducts = function(options?: UseQueryOptions<UserProduct[]> | undefined) {
  return useQuery<UserProduct[]>({
    queryKey: queryKeys.userProducts.list(),
    queryFn: userProductApi.getUserProducts,
    ...options,
  });
};

/**
 * React Query Hook for fetching a specific user product by ID
 * @param id - The ID of the user product to fetch
 * @param options - Additional React Query options (optional)
 * @returns Query result with user product data
 */
export const useUserProductById = function(id: number, options?: UseQueryOptions<UserProduct> | undefined) {
  if (id === undefined || id === null) {
    throw new Error('User product ID is required');
  }
  
  return useQuery<UserProduct>({
    queryKey: queryKeys.userProducts.detail(id),
    queryFn: function(): Promise<UserProduct> {
      return userProductApi.getUserProductById(id);
    },
    ...options,
  });
};

/**
 * React Query Hook for fetching user products by product ID
 * @param productId - The product ID to filter user products by
 * @param options - Additional React Query options (optional)
 * @returns Query result with filtered user products data
 */
export const useUserProductsByProductId = function(productId: number, options?: UseQueryOptions<UserProduct[]> | undefined) {
  if (productId === undefined || productId === null) {
    throw new Error('Product ID is required');
  }
  
  return useQuery<UserProduct[]>({
    queryKey: queryKeys.userProducts.byProduct(productId),
    queryFn: function(): Promise<UserProduct[]> {
      return userProductApi.getUserProductsByProductId(productId);
    },
    ...options,
  });
};

/**
 * React Query Hook for creating a new user product
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateUserProduct = function(mutationOptions?: UseMutationOptions<UserProduct, Error, CreateUserProductData> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<UserProduct, Error, CreateUserProductData>({
    mutationFn: userProductApi.createUserProduct,
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook for updating an existing user product
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateUserProduct = function(mutationOptions?: UseMutationOptions<UserProduct, Error, UpdateUserProductParams> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<UserProduct, Error, UpdateUserProductParams>({
    mutationFn: function(params: UpdateUserProductParams): Promise<UserProduct> {
      return userProductApi.updateUserProduct(params.id, params.data);
    },
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      
      // Update the specific item in the cache
      queryClient.setQueryData(queryKeys.userProducts.detail(variables.id), data);
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook for deleting a user product
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteUserProduct = function(mutationOptions?: UseMutationOptions<void, Error, number> | undefined) {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: userProductApi.deleteUserProduct,
    onSuccess: function(data, variables, context, mutation): void {
      // Invalidate the list query to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.userProducts.list() });
      
      // Remove the specific item from the cache
      queryClient.removeQueries({ queryKey: queryKeys.userProducts.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
