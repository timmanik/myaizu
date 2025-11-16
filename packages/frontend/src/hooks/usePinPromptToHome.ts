import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pinPrompt } from '@/services/api/user';
import { useToast } from '@/hooks/use-toast';

export const usePinPromptToHome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (promptId: string) => pinPrompt(promptId),
    onSuccess: () => {
      // Invalidate user pinned prompts query
      queryClient.invalidateQueries({ queryKey: ['user-pinned-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: 'Success',
        description: 'Prompt pinned to your home page',
      });
    },
    onError: (error: any) => {
      // The error structure from our API client is: { status, success, error: { code, message } }
      const errorMessage = error.error?.message || error.message || 'Failed to pin prompt';
      
      // Check if the error is about the pin limit
      const isPinLimitError = errorMessage.includes('can only pin up to 3 prompts') || 
                              errorMessage.includes('Unpin one first');
      
      if (isPinLimitError) {
        // Show a white informational message for pin limit
        toast({
          title: 'Pin Limit Reached!',
          description: 'You already have 3 pinned prompts. Remove one or more to add more pinned prompts.',
          variant: 'default',
        });
      } else {
        // Show a red error message for other errors
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
  });
};

