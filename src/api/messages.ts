import { apiFetch } from "./request";
import {
  messageSchema,
  messagesSchema,
  type GetMessagesParams,
  type Message,
  type NewMessage,
} from "@/types/messages";

export async function getMessages(
  params: GetMessagesParams = {},
): Promise<Message[]> {
  return apiFetch("/messages", { params, responseSchema: messagesSchema });
}

export async function createMessage(input: NewMessage): Promise<Message> {
  return apiFetch("/messages", {
    method: "POST",
    body: input,
    responseSchema: messageSchema,
  });
}
