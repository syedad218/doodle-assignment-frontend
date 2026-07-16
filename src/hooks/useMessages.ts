import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messages";
import type { ChatMessage } from "@/types/messages";

export function useMessages() {
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: () => getMessages(),
  });
}
