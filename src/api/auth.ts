import axiosClient from "./axiosClient";
import type { LoginRequest, LoginResponse } from "../types/api.types";

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


