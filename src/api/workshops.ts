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
  user?: {
    id: string;
    username: string;
    email: string;
  };
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

export async function updateMemberRole(
  workshopId: string,
  userId: string,
  role: "owner" | "admin" | "technician" | "member" | "viewer"
): Promise<WorkshopMember> {
  const { data } = await axiosClient.put<WorkshopMember>(
    `/api/v1/workshops/${workshopId}/members/${userId}/role`,
    { role }
  );
  return data;
}

export async function addMember(
  workshopId: string,
  payload: {
    email?: string;
    user_id?: string;
    role: "owner" | "admin" | "technician" | "member" | "viewer";
  }
): Promise<WorkshopMember> {
  const { data } = await axiosClient.post<WorkshopMember>(
    `/api/v1/workshops/${workshopId}/members`,
    payload
  );
  return data;
}

export async function removeMember(
  workshopId: string,
  userId: string
): Promise<void> {
  await axiosClient.delete(`/api/v1/workshops/${workshopId}/members/${userId}`);
}

export interface CreateWorkshopUserRequest {
  username: string;
  email: string;
  password: string;
  role: "admin" | "technician" | "member" | "viewer";
  is_active?: boolean;
}

export interface CreateWorkshopUserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  workshop_role: string;
  workshop_id: string;
}

export async function createWorkshopUser(
  workshopId: string,
  data: CreateWorkshopUserRequest
): Promise<CreateWorkshopUserResponse> {
  const { data: response } = await axiosClient.post<CreateWorkshopUserResponse>(
    `/api/v1/workshops/${workshopId}/users`,
    data
  );
  return response;
}

export interface MyWorkshopRole {
  workshop_id: string;
  user_id: string;
  role: "owner" | "admin" | "technician" | "member" | "viewer";
  is_active: boolean;
}

export async function getMyWorkshopRole(workshopId: string): Promise<MyWorkshopRole> {
  const { data } = await axiosClient.get<MyWorkshopRole>(
    `/api/v1/workshops/${workshopId}/my-role`
  );
  return data;
}

