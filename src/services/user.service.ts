import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User } from '@/types/user.types';
import { apiFetch, queryKeys } from '@/lib/api.base';

// User API Service
export const userApi = {
  getCurrentUser: () => apiFetch<User>('/user'),
  createUser: () => apiFetch<User>('/user', { method: 'POST' }),
  updateUser: (data: Partial<User>) => apiFetch<User>('/user', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getAllUsers: () => apiFetch<User[]>('/user/admin/all'),
  getUserById: (id: number) => apiFetch<User>(`/user/admin/${id}`),
  updateUserById: (id: number, data: Partial<User>) => apiFetch<User>(`/user/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUserById: (id: number) => apiFetch<void>(`/user/admin/${id}`, {
    method: 'DELETE',
  }),
};

// React Query Hooks
export const useCurrentUser = (options?: UseQueryOptions<User>) => 
  useQuery<User>({
    queryKey: queryKeys.users.current(),
    queryFn: userApi.getCurrentUser,
    ...options,
  });

export const useCreateUser = (options?: UseMutationOptions<User, Error, void>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, void>({
    mutationFn: userApi.createUser,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.current(), data);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

export const useUpdateUser = (options?: UseMutationOptions<User, Error, Partial<User>>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: userApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.current(), data);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

export const useAllUsers = (options?: UseQueryOptions<User[]>) => 
  useQuery<User[]>({
    queryKey: queryKeys.users.admin.list(),
    queryFn: userApi.getAllUsers,
    ...options,
  });

export const useUserById = (id: number, options?: UseQueryOptions<User>) => 
  useQuery<User>({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    ...options,
  });

export const useUpdateUserById = (options?: UseMutationOptions<User, Error, { id: number; data: Partial<User> }>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: number; data: Partial<User> }>({
    mutationFn: ({ id, data }) => userApi.updateUserById(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      options?.onSuccess?.(data, variables, options.context);
    },
    ...options,
  });
};

export const useDeleteUserById = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: userApi.deleteUserById,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.admin.list() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      options?.onSuccess?.(_, id, options.context);
    },
    ...options,
  });
};
