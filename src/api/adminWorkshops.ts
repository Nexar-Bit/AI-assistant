import axiosClient from "./axiosClient";

export interface WorkshopAdmin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  monthly_token_limit: number;
  tokens_used_this_month: number;
  token_reset_date: string | null;
  token_allocation_date: string | null;
  token_reset_day: number;
  is_active: boolean;
  allow_auto_invites: boolean;
  logo_url: string | null;
  primary_color: string | null;
  workshop_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkshopAdminRequest {
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  monthly_token_limit?: number;
  is_active?: boolean;
  allow_auto_invites?: boolean;
}

export interface UpdateWorkshopAdminRequest {
  name?: string;
  slug?: string;
  description?: string;
  monthly_token_limit?: number;
  is_active?: boolean;
  allow_auto_invites?: boolean;
  logo_url?: string;
  primary_color?: string;
  workshop_prompt?: string;
}

export async function createWorkshopAdmin(data: CreateWorkshopAdminRequest): Promise<WorkshopAdmin> {
  const response = await axiosClient.post("/api/v1/admin/workshops/", data);
  return response.data;
}

export async function fetchWorkshopsAdmin(
  params?: {
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<WorkshopAdmin[]> {
  const response = await axiosClient.get("/api/v1/admin/workshops/", { params });
  return response.data;
}

export async function getWorkshopAdmin(workshopId: string): Promise<WorkshopAdmin> {
  const response = await axiosClient.get(`/api/v1/admin/workshops/${workshopId}`);
  return response.data;
}

export async function updateWorkshopAdmin(workshopId: string, data: UpdateWorkshopAdminRequest): Promise<WorkshopAdmin> {
  const response = await axiosClient.patch(`/api/v1/admin/workshops/${workshopId}`, data);
  return response.data;
}

export async function deleteWorkshopAdmin(workshopId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/admin/workshops/${workshopId}`);
}

export async function toggleWorkshopActiveStatusAdmin(workshopId: string): Promise<WorkshopAdmin> {
  const response = await axiosClient.post(`/api/v1/admin/workshops/${workshopId}/toggle-active`);
  return response.data;
}

export async function setWorkshopTokenLimitAdmin(workshopId: string, new_limit: number): Promise<WorkshopAdmin> {
  const response = await axiosClient.post(`/api/v1/admin/workshops/${workshopId}/set-token-limit?new_limit=${new_limit}`);
  return response.data;
}

export interface WorkshopMembershipsResponse {
  workshop_users: Record<string, string[]>; // workshop_id -> list of user_ids
}

export async function getAllWorkshopMemberships(): Promise<WorkshopMembershipsResponse> {
  const response = await axiosClient.get("/api/v1/admin/workshops/memberships/all");
  return response.data;
}

// Legacy exports for backward compatibility
export type AdminWorkshop = WorkshopAdmin;
export async function listWorkshops(is_active?: boolean): Promise<AdminWorkshop[]> {
  return fetchWorkshopsAdmin({ is_active });
}
export async function getWorkshop(workshopId: string): Promise<AdminWorkshop> {
  return getWorkshopAdmin(workshopId);
}
export async function deleteWorkshop(workshopId: string): Promise<void> {
  return deleteWorkshopAdmin(workshopId);
}

