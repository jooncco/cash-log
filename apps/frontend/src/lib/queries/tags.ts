import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '../api/tags';
import { reportMutationError } from './mutationError';
import type { CreateTagRequest } from '../../types';

export const tagKeys = {
  all: ['tags'] as const,
};

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: () => tagApi.getAll(),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
    onError: reportMutationError,
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
    onError: reportMutationError,
  });
}
