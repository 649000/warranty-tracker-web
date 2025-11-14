/**
 * Shared HTTP method constants for consistent usage across services
 * Provides type safety and prevents typos in method strings
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH', // Optional: if needed for partial updates
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
