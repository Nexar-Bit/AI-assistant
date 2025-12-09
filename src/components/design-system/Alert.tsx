/** Alert component with success, warning, and error variants */

import React from "react";
import { CheckCircleIcon, AlertIcon, InfoIcon } from "../icons/AutomotiveIcons";

interface AlertProps {
  type: "success" | "warning" | "error" | "info";
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

const alertConfig = {
  success: {
    icon: CheckCircleIcon,
    iconColor: "text-success-400",
    bgColor: "bg-success-500/10",
    borderColor: "border-success-500/30",
    textColor: "text-success-400",
    titleColor: "text-success-400",
  },
  warning: {
    icon: AlertIcon,
    iconColor: "text-warning-400",
    bgColor: "bg-warning-500/10",
    borderColor: "border-warning-500/30",
    textColor: "text-warning-400",
    titleColor: "text-warning-400",
  },
  error: {
    icon: AlertIcon,
    iconColor: "text-error-400",
    bgColor: "bg-error-500/10",
    borderColor: "border-error-500/30",
    textColor: "text-error-400",
    titleColor: "text-error-400",
  },
  info: {
    icon: InfoIcon,
    iconColor: "text-primary-400",
    bgColor: "bg-primary-500/10",
    borderColor: "border-primary-500/30",
    textColor: "text-primary-400",
    titleColor: "text-primary-400",
  },
};

export function Alert({
  type,
  title,
  message,
  className = "",
  onClose,
}: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`card-industrial border-l-4 ${config.borderColor} ${config.bgColor} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`text-${config.textColor} hover:opacity-70 transition-opacity`}
            aria-label="Cerrar alerta"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

