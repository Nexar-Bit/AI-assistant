import axiosClient from "./axiosClient";
import type { LoginRequest, LoginResponse } from "../types/api.types";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  email_verification_required: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user_id: string;
  email: string;
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append("username", payload.username);
  formData.append("password", payload.password);

  const { data } = await axiosClient.post<LoginResponse>(
    "/api/v1/auth/login",
    formData,
  );
  return data;
}

export async function refreshTokenApi(): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>("/api/v1/auth/refresh");
  return data;
}

export async function registerApi(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await axiosClient.post<RegisterResponse>(
    "/api/v1/auth/register",
    payload,
  );
  return data;
}

export async function verifyEmailApi(token: string): Promise<VerifyEmailResponse> {
  const { data } = await axiosClient.post<VerifyEmailResponse>(
    "/api/v1/auth/verify-email",
    { token },
  );
  return data;
}

export async function resendVerificationApi(email: string): Promise<{ message: string }> {
  const { data } = await axiosClient.post<{ message: string }>(
    "/api/v1/auth/resend-verification",
    { email },
  );
  return data;
}


