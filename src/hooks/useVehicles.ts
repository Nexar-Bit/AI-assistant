import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export interface VehicleSummary {
  id: string;
  license_plate: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosClient.get<VehicleSummary[]>("/api/v1/vehicles/");
        setVehicles(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { vehicles, loading, error };
}


