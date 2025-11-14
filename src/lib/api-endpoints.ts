/**
 * Centralized API endpoint constants
 * Single source of truth for all API paths across services
 */
export const API_ENDPOINTS = {
  CLAIM: '/claim' as const,
  COMPANY: '/company' as const,
  PRODUCT: '/product' as const,
  USER_PRODUCT: '/user-product' as const,
  WARRANTY: '/warranty' as const,
  USER: '/user' as const,
  ADMIN_PATH: '/admin' as const, // Used for admin operations
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
