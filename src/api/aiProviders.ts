import axiosClient from './axiosClient';

// Types
export interface AIProvider {
  id: string;
  name: string;
  provider_type: string;
  api_key?: string;
  api_endpoint?: string;
  model_name?: string;
  is_active: boolean;
  description?: string;
  max_tokens_per_request?: number;
  rate_limit_per_minute?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkshopAIProvider {
  id: string;
  workshop_id: string;
  ai_provider_id: string;
  priority: number;
  is_enabled: boolean;
  custom_api_key?: string;
  custom_model?: string;
  custom_endpoint?: string;
  created_at: string;
  updated_at: string;
  ai_provider: AIProvider;
}

export interface CreateAIProviderRequest {
  name: string;
  provider_type: string;
  api_key?: string;
  api_endpoint?: string;
  model_name?: string;
  description?: string;
  max_tokens_per_request?: number;
  rate_limit_per_minute?: number;
  is_active?: boolean;
}

export interface UpdateAIProviderRequest {
  name?: string;
  api_key?: string;
  api_endpoint?: string;
  model_name?: string;
  description?: string;
  max_tokens_per_request?: number;
  rate_limit_per_minute?: number;
  is_active?: boolean;
}

export interface AssignProviderRequest {
  ai_provider_id: string;
  priority?: number;
  custom_api_key?: string;
  custom_model?: string;
  custom_endpoint?: string;
  is_enabled?: boolean;
}

// AI Providers CRUD (Global - Superuser only)

/**
 * Fetch all global AI providers
 */
export async function fetchAIProviders(): Promise<AIProvider[]> {
  const response = await axiosClient.get('/ai-providers');
  return response.data;
}

/**
 * Fetch a single AI provider by ID
 */
export async function getAIProvider(id: string): Promise<AIProvider> {
  const response = await axiosClient.get(`/ai-providers/${id}`);
  return response.data;
}

/**
 * Create a new AI provider (Superuser only)
 */
export async function createAIProvider(data: CreateAIProviderRequest): Promise<AIProvider> {
  const response = await axiosClient.post('/ai-providers', data);
  return response.data;
}

/**
 * Update an existing AI provider (Superuser only)
 */
export async function updateAIProvider(id: string, data: UpdateAIProviderRequest): Promise<AIProvider> {
  const response = await axiosClient.patch(`/ai-providers/${id}`, data);
  return response.data;
}

/**
 * Delete an AI provider (Superuser only)
 */
export async function deleteAIProvider(id: string): Promise<void> {
  await axiosClient.delete(`/ai-providers/${id}`);
}

// Workshop AI Providers (Workshop Admins)

/**
 * Get all AI providers assigned to a workshop
 */
export async function getWorkshopProviders(workshopId: string): Promise<WorkshopAIProvider[]> {
  const response = await axiosClient.get(`/ai-providers/workshops/${workshopId}/providers`);
  return response.data;
}

/**
 * Assign an AI provider to a workshop
 */
export async function assignProviderToWorkshop(
  workshopId: string,
  data: AssignProviderRequest
): Promise<WorkshopAIProvider> {
  const response = await axiosClient.post(`/ai-providers/workshops/${workshopId}/providers`, data);
  return response.data;
}

/**
 * Update a workshop's AI provider assignment
 */
export async function updateWorkshopProvider(
  workshopId: string,
  providerId: string,
  data: Partial<AssignProviderRequest>
): Promise<WorkshopAIProvider> {
  const response = await axiosClient.patch(
    `/ai-providers/workshops/${workshopId}/providers/${providerId}`,
    data
  );
  return response.data;
}

/**
 * Remove an AI provider from a workshop
 */
export async function removeProviderFromWorkshop(
  workshopId: string,
  providerId: string
): Promise<void> {
  await axiosClient.delete(`/ai-providers/workshops/${workshopId}/providers/${providerId}`);
}

/**
 * Get available providers (not yet assigned to workshop)
 */
export async function getAvailableProviders(workshopId: string): Promise<AIProvider[]> {
  const [allProviders, workshopProviders] = await Promise.all([
    fetchAIProviders(),
    getWorkshopProviders(workshopId),
  ]);

  const assignedIds = new Set(workshopProviders.map(wp => wp.ai_provider_id));
  return allProviders.filter(provider => !assignedIds.has(provider.id) && provider.is_active);
}

