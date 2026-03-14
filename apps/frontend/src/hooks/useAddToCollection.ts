import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '../services/api/collections';
import { useToast } from './use-toast';

export const useAddToCollection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, collectionId }: { promptId: string; collectionId: string }) => {
      await collectionsApi.addPromptToCollection(collectionId, promptId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Prompt added to collection!',
      });
      // Invalidate collections queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to add prompt to collection';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    },
  });
};
