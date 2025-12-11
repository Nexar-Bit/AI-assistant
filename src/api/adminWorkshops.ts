import axiosClient from "./axiosClient";

export interface AdminWorkshop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  monthly_token_limit: number;
  tokens_used_this_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkshopUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  monthly_token_limit?: number;
}

// Workshops Management API
export async function listWorkshops(is_active?: boolean): Promise<AdminWorkshop[]> {
  const params = new URLSearchParams();
  if (is_active !== undefined) params.append("is_active", String(is_active));
  
  const response = await axiosClient.get(`/api/v1/admin/workshops/?${params.toString()}`);
  return response.data;
}

export async function getWorkshop(workshopId: string): Promise<AdminWorkshop> {
  const response = await axiosClient.get(`/api/v1/admin/workshops/${workshopId}`);
  return response.data;
}

export async function updateWorkshop(workshopId: string, data: WorkshopUpdate): Promise<AdminWorkshop> {
  const response = await axiosClient.put(`/api/v1/admin/workshops/${workshopId}`, data);
  return response.data;
}

export async function blockWorkshop(workshopId: string): Promise<AdminWorkshop> {
  const response = await axiosClient.post(`/api/v1/admin/workshops/${workshopId}/block`);
  return response.data;
}

export async function unblockWorkshop(workshopId: string): Promise<AdminWorkshop> {
  const response = await axiosClient.post(`/api/v1/admin/workshops/${workshopId}/unblock`);
  return response.data;
}

export async function deleteWorkshop(workshopId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/admin/workshops/${workshopId}`);
}

