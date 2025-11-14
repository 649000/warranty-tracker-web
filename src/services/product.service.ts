import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Product } from '@/types/product.types';
import { apiFetch, queryKeys } from '@/lib/api.base';
import { HTTP_METHODS } from '@/lib/http-methods';
import { API_ENDPOINTS as ENDPOINTS } from '@/lib/api-endpoints';

/**
 * Type alias for product data used in create operations
 * Required fields: name, modelNumber
 */
type CreateProductData = Pick<Product, 'name' | 'modelNumber'>;

/**
 * Type alias for product data used in update operations
 * All fields are optional since updates can be partial
 */
type UpdateProductData = Partial<Product>;

/**
 * Parameters for update product mutation
 */
type UpdateProductParams = {
  id: number;
  data: UpdateProductData;
};

/**
 * Product API Service - Handles all HTTP operations for products
 */
export const productApi = {
  /**
   * Fetch all products
   * @returns Promise that resolves to array of products
   */
  getAllProducts: (): Promise<Product[]> => 
    apiFetch<Product[]>(ENDPOINTS.PRODUCT),

  /**
   * Fetch a specific product by ID
   * @param id - The unique identifier of the product
   * @returns Promise that resolves to the product data
   */
  getProductById: (id: number): Promise<Product> => 
    apiFetch<Product>(`${ENDPOINTS.PRODUCT}/${id}`),

  /**
   * Search products by name, brand, or model number
   * @param params - Search parameters (name, brand, modelNumber - optional)
   * @returns Promise that resolves to array of matching products
   */
  searchProducts: (params: { name?: string; brand?: string; modelNumber?: string }): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    return apiFetch<Product[]>(`${ENDPOINTS.PRODUCT}/search?${queryParams.toString()}`);
  },

  /**
   * Create a new product (admin operation)
   * @param data - Product data (name and modelNumber required)
   * @returns Promise that resolves to the created product
   */
  createProduct: (data: CreateProductData): Promise<Product> => 
    apiFetch<Product>(`${ENDPOINTS.PRODUCT}${ENDPOINTS.ADMIN_PATH}`, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    }),

  /**
   * Update an existing product (admin operation)
   * @param id - The unique identifier of the product to update
   * @param data - Partial product data to update
   * @returns Promise that resolves to the updated product
   */
  updateProduct: (id: number, data: UpdateProductData): Promise<Product> => 
    apiFetch<Product>(`${ENDPOINTS.PRODUCT}${ENDPOINTS.ADMIN_PATH}/${id}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
    }),

  /**
   * Delete a product (admin operation)
   * @param id - The unique identifier of the product to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteProduct: (id: number): Promise<void> => 
    apiFetch<void>(`${ENDPOINTS.PRODUCT}${ENDPOINTS.ADMIN_PATH}/${id}`, {
      method: HTTP_METHODS.DELETE,
    }),
};

/**
 * React Query Hook: Fetch all products
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with product data and loading states
 */
export const useAllProducts = (queryOptions?: UseQueryOptions<Product[]> | undefined) => 
  useQuery<Product[]>({
    queryKey: queryKeys.products.list(),
    queryFn: productApi.getAllProducts,
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Fetch a specific product by ID
 * @param id - The unique identifier of the product
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with product data and loading states
 */
export const useProductById = (id: number, queryOptions?: UseQueryOptions<Product> | undefined) => 
  useQuery<Product>({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.getProductById(id),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Search products by parameters
 * @param params - Search parameters (name, brand, modelNumber)
 * @param queryOptions - Optional React Query options for this query
 * @returns Query object with matching products and loading states
 */
export const useSearchProducts = (
  params: { name?: string; brand?: string; modelNumber?: string },
  queryOptions?: UseQueryOptions<Product[]> | undefined
) => 
  useQuery<Product[]>({
    queryKey: queryKeys.products.search(params),
    queryFn: () => productApi.searchProducts(params),
    ...(queryOptions || {}),
  });

/**
 * React Query Hook: Create a new product (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useCreateProduct = (mutationOptions?: UseMutationOptions<Product, Error, CreateProductData> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Product, Error, CreateProductData>({
    mutationFn: productApi.createProduct,
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate products list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};

/**
 * React Query Hook: Update an existing product (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useUpdateProduct = (mutationOptions?: UseMutationOptions<Product, Error, UpdateProductParams> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<Product, Error, UpdateProductParams>({
    mutationFn: (params: UpdateProductParams): Promise<Product> => 
      productApi.updateProduct(params.id, params.data),
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate products list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      
      // Update the specific product in cache for immediate UI update
      queryClient.setQueryData(
        queryKeys.products.detail(variables.id), 
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
 * React Query Hook: Delete a product (admin)
 * @param mutationOptions - Optional mutation options including success callback
 * @returns Mutation object with mutate function and states
 */
export const useDeleteProduct = (mutationOptions?: UseMutationOptions<void, Error, number> | undefined) => {
  const queryClient = useQueryClient();
  
  // Extract user-provided success callback
  const { onSuccess: userProvidedSuccessCallback } = mutationOptions || {};
  const remainingOptions = mutationOptions ? { ...mutationOptions } : {};
  if (remainingOptions.onSuccess) {
    delete remainingOptions.onSuccess;
  }
  
  return useMutation<void, Error, number>({
    mutationFn: productApi.deleteProduct,
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate products list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list() });
      
      // Remove the specific product from cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(variables) });
      
      // Call user-provided success callback if they gave one
      if (userProvidedSuccessCallback) {
        userProvidedSuccessCallback(data, variables, context, mutation);
      }
    },
    ...remainingOptions,
  });
};
