import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messages";

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () => getMessages(),
  });
}
