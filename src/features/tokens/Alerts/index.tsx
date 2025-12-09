/** Token alert component for low token warnings */

import React from "react";
import { AlertIcon } from "../../../components/icons/AutomotiveIcons";

interface TokenAlertProps {
  type: "critical" | "warning";
  message: string;
  remaining?: number;
  resetDate?: string;
}

export function TokenAlert({ type, message, remaining, resetDate }: TokenAlertProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        type === "critical"
          ? "bg-error-500/10 border-error-500/30"
          : "bg-warning-500/10 border-warning-500/30"
      }`}
    >
      <div className="flex items-start gap-2">
        <AlertIcon
          size={16}
          className={type === "critical" ? "text-error-400" : "text-warning-400"}
        />
        <div className="flex-1">
          <p className="text-xs font-medium text-industrial-200">{message}</p>
          {remaining !== undefined && (
            <p className="text-xs text-industrial-400 mt-1">
              {remaining.toLocaleString()} restantes
            </p>
          )}
          {resetDate && (
            <p className="text-xs text-industrial-500 mt-1">
              Reinicia: {new Date(resetDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

