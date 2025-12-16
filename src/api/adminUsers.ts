import axiosClient from "./axiosClient";

export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  role: "owner" | "admin" | "technician" | "viewer" | "member";
  is_active: boolean;
  registration_approved: boolean;
  daily_token_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserAdminRequest {
  username: string;
  email: string;
  password: string;
  role?: "owner" | "admin" | "technician" | "viewer" | "member";
  is_active?: boolean;
  registration_approved?: boolean;
}

export interface UpdateUserAdminRequest {
  username?: string;
  email?: string;
  role?: "owner" | "admin" | "technician" | "viewer" | "member";
  is_active?: boolean;
  registration_approved?: boolean;
}

export interface ResetPasswordRequest {
  new_password: string;
}

export async function createUserAdmin(data: CreateUserAdminRequest): Promise<UserAdmin> {
  const response = await axiosClient.post("/api/v1/admin/users/", data);
  return response.data;
}

export async function fetchUsersAdmin(
  params?: {
    is_active?: boolean;
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<UserAdmin[]> {
  const response = await axiosClient.get("/api/v1/admin/users/", { params });
  return response.data;
}

export async function getUserAdmin(userId: string): Promise<UserAdmin> {
  const response = await axiosClient.get(`/api/v1/admin/users/${userId}`);
  return response.data;
}

export async function updateUserAdmin(userId: string, data: UpdateUserAdminRequest): Promise<UserAdmin> {
  const response = await axiosClient.patch(`/api/v1/admin/users/${userId}`, data);
  return response.data;
}

export async function deleteUserAdmin(userId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/admin/users/${userId}`);
}

export async function resetUserPasswordAdmin(userId: string, data: ResetPasswordRequest): Promise<{ message: string }> {
  const response = await axiosClient.post(`/api/v1/admin/users/${userId}/reset-password`, data);
  return response.data;
}

export async function toggleUserActiveStatusAdmin(userId: string): Promise<UserAdmin> {
  const response = await axiosClient.post(`/api/v1/admin/users/${userId}/toggle-active`);
  return response.data;
}

// Legacy exports for backward compatibility
export type AdminUser = UserAdmin;
export type UserCreate = CreateUserAdminRequest;
export type UserUpdate = UpdateUserAdminRequest;
export type PasswordReset = ResetPasswordRequest;

export async function listUsers(role?: string, is_active?: boolean): Promise<AdminUser[]> {
  return fetchUsersAdmin({ role, is_active });
}
export async function getUser(userId: string): Promise<AdminUser> {
  return getUserAdmin(userId);
}
export async function createUser(data: UserCreate): Promise<AdminUser> {
  return createUserAdmin(data);
}
export async function updateUser(userId: string, data: UserUpdate): Promise<AdminUser> {
  return updateUserAdmin(userId, data);
}
export async function deleteUser(userId: string): Promise<void> {
  return deleteUserAdmin(userId);
}
export async function resetUserPassword(userId: string, data: PasswordReset): Promise<{ message: string }> {
  return resetUserPasswordAdmin(userId, data);
}

