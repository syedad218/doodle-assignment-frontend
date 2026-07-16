import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "@/api/messages";
import { MESSAGES_QUERY_KEY } from "@/lib/constants";
import type { ChatMessage } from "@/types/messages";


const POLL_INTERVAL_MS = 3_000;
const POLL_ERROR_INTERVAL_MS = 30_000; // reduce polling frequency on error

export function useMessages() {
  const queryClient = useQueryClient();

  return useQuery<ChatMessage[]>({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: async () => {
      const cached = queryClient.getQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY);
      // Cursor = createdAt of the newest server-confirmed message.
      // Pending/Failed messages are preserved in the list.
      const cursor = cached?.findLast((m) => !m.status)?.createdAt;

      if (!cursor) return getMessages();

      const fresh = await getMessages({ after: cursor });

      const currentCache =
        queryClient.getQueryData<ChatMessage[]>(MESSAGES_QUERY_KEY) ?? [];
      // Deduplicate messages from server response and existing cache.
      const AlreadyKnown = new Set(currentCache.map((m) => m._id));
      return [
        ...currentCache,
        ...fresh.filter((m) => !AlreadyKnown.has(m._id)),
      ];
    },
    refetchInterval: (query) =>
      query.state.status === "error"
        ? POLL_ERROR_INTERVAL_MS
        : POLL_INTERVAL_MS,
  });
}
