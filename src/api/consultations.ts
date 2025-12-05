import axiosClient from "./axiosClient";
import type {
  Consultation,
  CreateConsultationRequest,
} from "../types/consultation.types";
import type { ConsultationFilters } from "../hooks/useConsultations";

export interface ConsultationListResponse {
  items: Consultation[];
  next_cursor: string | null;
}

export async function fetchConsultations(
  params?: ConsultationFilters & { cursor?: string },
): Promise<ConsultationListResponse> {
  const { data } = await axiosClient.get<ConsultationListResponse>(
    "/api/v1/consultations/",
    { params },
  );
  return data;
}

export async function createConsultation(
  payload: CreateConsultationRequest,
): Promise<Consultation> {
  const { data } = await axiosClient.post<Consultation>(
    "/api/v1/consultations/",
    payload,
  );
  return data;
}

export async function updateConsultation(
  id: string,
  payload: Partial<Consultation> & { version: number },
): Promise<Consultation> {
  const { data } = await axiosClient.put<Consultation>(
    `/api/v1/consultations/${id}`,
    payload,
  );
  return data;
}


