/**
 * Admin API - For superuser administration
 */

import axiosClient from './axiosClient';

export interface PendingRegistration {
  id: string;
  username: string;
  email: string;
  registration_message?: string;
  registration_approved: boolean;
  is_active: boolean;
  role: string;
  created_at: string;
}

export interface WorkshopStats {
  id: string;
  name: string;
  member_count: number;
  tokens_used: number;
  tokens_limit: number;
  active_consultations: number;
  last_activity?: string;
}

// Registration Management
export async function getPendingRegistrations(): Promise<PendingRegistration[]> {
  const response = await axiosClient.get('/api/v1/admin/registrations/pending');
  return response.data;
}

export interface ApproveRegistrationRequest {
  approved: boolean;
  workshop_id?: string;
  workshop_role?: string;
}

export async function approveRegistration(
  userId: string,
  data: ApproveRegistrationRequest
): Promise<{message: string; user_id: string; workshop_assigned?: boolean; workshop_id?: string}> {
  const response = await axiosClient.post(
    `/api/v1/admin/registrations/${userId}/approve`,
    data
  );
  return response.data;
}

export async function getAllRegistrations(includeApproved = false): Promise<PendingRegistration[]> {
  const response = await axiosClient.get('/api/v1/admin/registrations', {
    params: { include_approved: includeApproved },
  });
  return response.data;
}

export interface TechnicianStats {
  user_id: string;
  username: string;
  email: string;
  consultations_count: number;
  tokens_used: number;
  vehicles_created: number;
  last_activity?: string;
}

export interface WorkshopDetail {
  workshop: WorkshopStats;
  technicians: TechnicianStats[];
}

// Workshop Statistics
export async function getWorkshopsStats(): Promise<WorkshopStats[]> {
  const response = await axiosClient.get('/api/v1/admin/workshops/stats');
  return response.data;
}

export async function getWorkshopDetail(workshopId: string): Promise<WorkshopDetail> {
  const response = await axiosClient.get(`/api/v1/admin/workshops/${workshopId}/detail`);
  return response.data;
}
