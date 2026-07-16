import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMessage } from "@/api/messages";
import { MESSAGE_STATUS, MESSAGES_QUERY_KEY } from "@/lib/constants";
import type { ChatMessage, NewMessage } from "@/types/messages";


export function useSendMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMessage,

    onMutate: async (input: NewMessage) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_QUERY_KEY });

      const optimistic: ChatMessage = {
        _id: `temp-${crypto.randomUUID()}`,
        author: input.author,
        message: input.message,
        createdAt: new Date().toISOString(),
        status: MESSAGE_STATUS.pending,
      };
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY, (old = []) => [
        ...old,
        optimistic,
      ]);

      return { optimisticId: optimistic._id };
    },

    onSuccess: async (serverMessage, _input, context) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_QUERY_KEY });
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY, (old = []) =>
        old.map((m) => (m._id === context.optimisticId ? serverMessage : m)),
      );
    },

    onError: async (_error, _input, context) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_QUERY_KEY });
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY, (old = []) =>
        old.map((m) =>
          m._id === context?.optimisticId
            ? { ...m, status: MESSAGE_STATUS.failed }
            : m,
        ),
      );
    },
  });

  const { mutate } = mutation;

  const retry = useCallback(
    (failed: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY, (old = []) =>
        old.filter((m) => m._id !== failed._id),
      );
      mutate({ author: failed.author, message: failed.message });
    },
    [queryClient, mutate],
  );

  return { ...mutation, retry };
}
