/** Token usage display component */

import React, { useEffect, useState } from "react";
import { getRemainingTokens } from "../../api/tokens";
import { ActivityIcon, AlertIcon } from "../icons/AutomotiveIcons";
import { TokenMeter } from "../design-system/TokenMeter";
import { TokenUsageReportModal } from "../design-system/TokenUsageReportModal";

interface TokenUsageDisplayProps {
  workshopId: string;
}

export function TokenUsageDisplay({ workshopId }: TokenUsageDisplayProps) {
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    loadTokenData();
    // Refresh every 30 seconds
    const interval = setInterval(loadTokenData, 30000);
    return () => clearInterval(interval);
  }, [workshopId]);

  const loadTokenData = async () => {
    try {
      const data = await getRemainingTokens(workshopId);
      setTokenData(data);
    } catch (err) {
      console.error("Failed to load token data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-industrial animate-pulse">
        <div className="h-4 bg-industrial-700 rounded w-3/4 mb-2" />
        <div className="h-2 bg-industrial-700 rounded" />
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  const { remaining, notifications } = tokenData;
  const user = remaining?.user;
  const workshop = remaining?.workshop;

  // Calculate percentages
  const userDailyPercent =
    user?.daily_limit
      ? (user.daily_used / user.daily_limit) * 100
      : 0;
  const workshopMonthlyPercent =
    workshop?.monthly_limit
      ? (workshop.monthly_used / workshop.monthly_limit) * 100
      : 0;

  // Determine status
  const userStatus =
    userDailyPercent >= 90
      ? "critical"
      : userDailyPercent >= 75
      ? "warning"
      : "ok";
  const workshopStatus =
    workshopMonthlyPercent >= 90
      ? "critical"
      : workshopMonthlyPercent >= 75
      ? "warning"
      : "ok";

  return (
    <div className="space-y-4">
      {/* User Daily Usage */}
      {user && !user.is_unlimited && user.daily_limit && (
        <TokenMeter
          used={user.daily_used || 0}
          limit={user.daily_limit}
          inputTokens={user.input_tokens_today}
          outputTokens={user.output_tokens_today}
          label="Tu límite diario"
          onDetailedReport={() => {
            setSelectedReport({
              used: user.daily_used || 0,
              limit: user.daily_limit,
              inputTokens: user.input_tokens_today,
              outputTokens: user.output_tokens_today,
              label: "Tu límite diario",
              period: "Hoy",
            });
            setReportModalOpen(true);
          }}
        />
      )}

      {/* Workshop Monthly Usage */}
      {workshop && (
        <TokenMeter
          used={workshop.monthly_used || 0}
          limit={workshop.monthly_limit || 0}
          inputTokens={workshop.input_tokens_month}
          outputTokens={workshop.output_tokens_month}
          label="Taller mensual"
          onDetailedReport={() => {
            setSelectedReport({
              used: workshop.monthly_used || 0,
              limit: workshop.monthly_limit || 0,
              inputTokens: workshop.input_tokens_month,
              outputTokens: workshop.output_tokens_month,
              label: "Taller mensual",
              period: "Este mes",
              resetDate: workshop.reset_date,
            });
            setReportModalOpen(true);
          }}
        />
      )}

      {/* Notifications */}
      {notifications && (
        <div className="space-y-2">
          {notifications.workshop_notifications?.map((notif: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                notif.type === "critical"
                  ? "bg-error-500/10 border-error-500/30"
                  : "bg-warning-500/10 border-warning-500/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertIcon
                  size={16}
                  className={
                    notif.type === "critical" ? "text-error-400" : "text-warning-400"
                  }
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-industrial-200">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.user_notifications?.map((notif: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                notif.type === "critical"
                  ? "bg-error-500/10 border-error-500/30"
                  : "bg-warning-500/10 border-warning-500/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertIcon
                  size={16}
                  className={
                    notif.type === "critical" ? "text-error-400" : "text-warning-400"
                  }
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-industrial-200">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Report Modal */}
      {selectedReport && (
        <TokenUsageReportModal
          open={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedReport(null);
          }}
          tokenData={selectedReport}
        />
      )}
    </div>
  );
}

