import axiosClient from "./axiosClient";

export interface GlobalPrompt {
  id: string;
  prompt_text: string;
  name: string | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GlobalPromptCreate {
  prompt_text: string;
  name?: string;
  is_active?: boolean;
}

export interface GlobalPromptUpdate {
  prompt_text?: string;
  name?: string;
  is_active?: boolean;
}

// Global Prompts API
export async function getGlobalPrompts(): Promise<GlobalPrompt[]> {
  const response = await axiosClient.get("/api/v1/prompts/global");
  return response.data;
}

export async function getActiveGlobalPrompt(): Promise<GlobalPrompt | null> {
  const response = await axiosClient.get("/api/v1/prompts/global/active");
  return response.data;
}

export async function getGlobalPrompt(promptId: string): Promise<GlobalPrompt> {
  const response = await axiosClient.get(`/api/v1/prompts/global/${promptId}`);
  return response.data;
}

export async function createGlobalPrompt(data: GlobalPromptCreate): Promise<GlobalPrompt> {
  const response = await axiosClient.post("/api/v1/prompts/global", data);
  return response.data;
}

export async function updateGlobalPrompt(
  promptId: string,
  data: GlobalPromptUpdate
): Promise<GlobalPrompt> {
  const response = await axiosClient.put(`/api/v1/prompts/global/${promptId}`, data);
  return response.data;
}

export async function deleteGlobalPrompt(promptId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/prompts/global/${promptId}`);
}

// Workshop Prompts API
export async function getWorkshopPrompt(workshopId: string): Promise<string | null> {
  const response = await axiosClient.get(`/api/v1/prompts/workshop/${workshopId}`);
  return response.data;
}

export async function updateWorkshopPrompt(
  workshopId: string,
  prompt: string
): Promise<{ workshop_prompt: string | null }> {
  const response = await axiosClient.put(`/api/v1/prompts/workshop/${workshopId}`, {
    workshop_prompt: prompt,
  });
  return response.data;
}

