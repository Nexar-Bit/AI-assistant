/** Token usage dashboard component */

import React, { useEffect, useState } from "react";
import { getRemainingTokens } from "../../../api/tokens";
import { TokenMeter } from "../TokenMeter";
import { useWorkshopStore } from "../../../stores/workshop.store";

export function UsageDashboard() {
  const { currentWorkshop } = useWorkshopStore();
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentWorkshop) {
      loadTokenData();
      const interval = setInterval(loadTokenData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [currentWorkshop?.id]);

  const loadTokenData = async () => {
    if (!currentWorkshop) return;
    
    try {
      const data = await getRemainingTokens(currentWorkshop.id);
      setTokenData(data);
    } catch (err) {
      console.error("Failed to load token data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !tokenData) {
    return (
      <div className="card-industrial animate-pulse">
        <div className="h-4 bg-industrial-700 rounded w-3/4 mb-2" />
        <div className="h-2 bg-industrial-700 rounded" />
      </div>
    );
  }

  const { remaining, notifications } = tokenData;
  const user = remaining?.user;
  const workshop = remaining?.workshop;

  return (
    <div className="space-y-4">
      {/* User Daily Usage */}
      {user && !user.is_unlimited && user.daily_limit && (
        <TokenMeter
          used={user.daily_used}
          limit={user.daily_limit}
          label="Tu límite diario"
        />
      )}

      {/* Workshop Monthly Usage */}
      {workshop && (
        <TokenMeter
          used={workshop.monthly_used}
          limit={workshop.monthly_limit}
          label="Taller mensual"
        />
      )}

      {/* Reset Info */}
      {workshop?.reset_date && (
        <div className="text-xs text-industrial-500 text-center">
          Reinicia: {new Date(workshop.reset_date).toLocaleDateString()}
        </div>
      )}

      {/* Token Alerts */}
      {notifications && (
        <div className="space-y-2">
          {notifications.workshop_notifications?.map((notif: any, idx: number) => (
            <div
              key={`workshop-${idx}`}
              className={`p-2 rounded border text-xs ${
                notif.type === "critical"
                  ? "bg-error-500/10 border-error-500/30 text-error-400"
                  : "bg-warning-500/10 border-warning-500/30 text-warning-400"
              }`}
            >
              {notif.message}
            </div>
          ))}
          {notifications.user_notifications?.map((notif: any, idx: number) => (
            <div
              key={`user-${idx}`}
              className={`p-2 rounded border text-xs ${
                notif.type === "critical"
                  ? "bg-error-500/10 border-error-500/30 text-error-400"
                  : "bg-warning-500/10 border-warning-500/30 text-warning-400"
              }`}
            >
              {notif.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

