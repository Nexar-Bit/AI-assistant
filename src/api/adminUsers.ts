import axiosClient from "./axiosClient";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "technician" | "viewer";
  is_active: boolean;
  email_verified: boolean;
  daily_token_limit: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: "admin" | "technician" | "viewer";
  is_active?: boolean;
  email_verified?: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: "admin" | "technician" | "viewer";
  is_active?: boolean;
  daily_token_limit?: number;
}

export interface PasswordReset {
  new_password: string;
}

// Users Management API
export async function listUsers(role?: string, is_active?: boolean): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (is_active !== undefined) params.append("is_active", String(is_active));
  
  const response = await axiosClient.get(`/api/v1/admin/users/?${params.toString()}`);
  return response.data;
}

export async function getUser(userId: string): Promise<AdminUser> {
  const response = await axiosClient.get(`/api/v1/admin/users/${userId}`);
  return response.data;
}

export async function createUser(data: UserCreate): Promise<AdminUser> {
  const response = await axiosClient.post("/api/v1/admin/users/", data);
  return response.data;
}

export async function updateUser(userId: string, data: UserUpdate): Promise<AdminUser> {
  const response = await axiosClient.put(`/api/v1/admin/users/${userId}`, data);
  return response.data;
}

export async function resetUserPassword(userId: string, data: PasswordReset): Promise<{ message: string; user_id: string }> {
  const response = await axiosClient.post(`/api/v1/admin/users/${userId}/reset-password`, data);
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/admin/users/${userId}`);
}

