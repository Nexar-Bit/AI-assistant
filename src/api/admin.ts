/**
 * Admin API - For superuser administration
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PendingRegistration {
  id: string;
  username: string;
  email: string;
  registration_message?: string;
  registration_approved: boolean;
  email_verified: boolean;
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
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/admin/registrations/pending`,
    { withCredentials: true }
  );
  return response.data;
}

export async function approveRegistration(userId: string, approved: boolean): Promise<{message: string}> {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/admin/registrations/${userId}/approve`,
    { approved },
    { withCredentials: true }
  );
  return response.data;
}

export async function getAllRegistrations(includeApproved = false): Promise<PendingRegistration[]> {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/admin/registrations`,
    {
      params: { include_approved: includeApproved },
      withCredentials: true,
    }
  );
  return response.data;
}
