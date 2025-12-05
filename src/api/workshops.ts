import axiosClient from "./axiosClient";
import type { Workshop, WorkshopListResponse } from "../types/workshop.types";

export async function fetchWorkshops(): Promise<WorkshopListResponse> {
  const { data } = await axiosClient.get<WorkshopListResponse>("/api/v1/workshops/");
  return data;
}

export async function createWorkshop(payload: {
  name: string;
  slug?: string;
  description?: string;
  monthly_token_limit?: number;
}): Promise<Workshop> {
  const { data } = await axiosClient.post<Workshop>("/api/v1/workshops/", payload);
  return data;
}

export async function getWorkshop(workshopId: string): Promise<Workshop> {
  const { data } = await axiosClient.get<Workshop>(`/api/v1/workshops/${workshopId}`);
  return data;
}

export async function updateWorkshop(
  workshopId: string,
  payload: Partial<Workshop>,
): Promise<Workshop> {
  const { data } = await axiosClient.put<Workshop>(
    `/api/v1/workshops/${workshopId}`,
    payload,
  );
  return data;
}

export interface WorkshopMember {
  id: string;
  workshop_id: string;
  user_id: string;
  role: "owner" | "admin" | "technician" | "member" | "viewer";
  is_active: boolean;
  invited_by?: string;
  created_at: string;
}

export interface WorkshopMembersResponse {
  members: WorkshopMember[];
}

export async function getWorkshopMembers(
  workshopId: string,
): Promise<WorkshopMembersResponse> {
  const { data } = await axiosClient.get<WorkshopMembersResponse>(
    `/api/v1/workshops/${workshopId}/members`,
  );
  return data;
}

export interface WorkshopCustomizationUpdate {
  logo_url?: string;
  primary_color?: string;
  vehicle_templates?: Record<string, any>;
  quick_replies?: Record<string, any>;
  diagnostic_code_library?: Record<string, any>;
}

export async function updateWorkshopCustomization(
  workshopId: string,
  payload: WorkshopCustomizationUpdate,
): Promise<Workshop> {
  const { data } = await axiosClient.put<Workshop>(
    `/api/v1/workshops/${workshopId}/customization`,
    payload,
  );
  return data;
}

