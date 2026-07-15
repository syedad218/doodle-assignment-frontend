import { apiFetch } from "./request";
import type { GetMessagesParams, Message, NewMessage } from "@/types/messages";

export async function getMessages(
  params: GetMessagesParams = {},
): Promise<Message[]> {
  return apiFetch<Message[]>("/messages", { params });
}

export async function createMessage(input: NewMessage): Promise<Message> {
  return apiFetch<Message>("/messages", { method: "POST", body: input });
}
