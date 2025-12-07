/** Vehicle management API client */

import axiosClient from "./axiosClient";

export interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  current_km?: number;
  last_service_km?: number;
  last_service_date?: string;
  engine_type?: string;
  fuel_type?: string;
  workshop_id?: string;
  created_at: string;
  updated_at: string;
}

export async function getVehicle(vehicleId: string): Promise<Vehicle> {
  const { data } = await axiosClient.get<Vehicle>(`/api/v1/vehicles/${vehicleId}`);
  return data;
}

export async function fetchVehicles(params?: {
  workshop_id?: string;
  license_plate?: string;
}): Promise<{ vehicles: Vehicle[] }> {
  const { data } = await axiosClient.get<Vehicle[]>(
    "/api/v1/vehicles/",
    { params }
  );
  return { vehicles: data };
}

export async function searchVehicles(licensePlate: string): Promise<Vehicle[]> {
  const { data } = await axiosClient.get<Vehicle[]>("/api/v1/vehicles/", {
    params: { license_plate: licensePlate },
  });
  return data;
}

export async function createVehicle(payload: {
  license_plate: string;
  workshop_id?: string;
  vehicle_type?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  current_km?: number;
  last_service_km?: number;
  last_service_date?: string;
  engine_type?: string;
  fuel_type?: string;
}): Promise<Vehicle> {
  const { data } = await axiosClient.post<Vehicle>("/api/v1/vehicles/", payload);
  return data;
}

export async function updateVehicle(
  vehicleId: string,
  payload: {
    license_plate?: string;
    vehicle_type?: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    current_km?: number;
    last_service_km?: number;
    last_service_date?: string;
    engine_type?: string;
    fuel_type?: string;
    workshop_id?: string;
  }
): Promise<Vehicle> {
  const { data } = await axiosClient.put<Vehicle>(
    `/api/v1/vehicles/${vehicleId}`,
    payload
  );
  return data;
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await axiosClient.delete(`/api/v1/vehicles/${vehicleId}`);
}

