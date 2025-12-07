export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: "admin" | "technician" | "viewer";
}

export interface WorkshopInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: "owner" | "admin" | "technician" | "member" | "viewer";
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserInfo;
  workshops: WorkshopInfo[];
}


