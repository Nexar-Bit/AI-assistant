import axiosClient from "./axiosClient";
import type {
  ChatThread,
  ChatThreadResponse,
  ChatThreadListResponse,
  CreateChatThreadRequest,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

export async function fetchChatThreads(params?: {
  workshop_id?: string;
  license_plate?: string;
  is_resolved?: boolean;
  is_archived?: boolean;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ChatThreadListResponse> {
  const { data } = await axiosClient.get<ChatThreadListResponse>(
    "/api/v1/chat/threads",
    { params },
  );
  return data;
}

export async function createChatThread(
  payload: CreateChatThreadRequest,
): Promise<ChatThread> {
  const { data } = await axiosClient.post<ChatThread>(
    "/api/v1/chat/threads",
    payload,
  );
  return data;
}

export async function getChatThread(threadId: string): Promise<ChatThreadResponse> {
  const { data } = await axiosClient.get<ChatThreadResponse>(
    `/api/v1/chat/threads/${threadId}`,
  );
  return data;
}

export async function sendMessage(
  threadId: string,
  payload: SendMessageRequest,
): Promise<SendMessageResponse> {
  const { data } = await axiosClient.post<SendMessageResponse>(
    `/api/v1/chat/threads/${threadId}/messages`,
    payload,
  );
  return data;
}

