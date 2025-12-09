/** Notification component with different types and styles */

import React from "react";
import { useTranslation } from "react-i18next";

export type NotificationType = "warning" | "critical" | "info" | "success";

export interface NotificationProps {
  type: NotificationType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

const notificationConfig = {
  warning: {
    icon: "🔔",
    bgColor: "bg-warning-500/10",
    borderColor: "border-warning-500/30",
    textColor: "text-warning-400",
    iconBg: "bg-warning-500/20",
  },
  critical: {
    icon: "⚠️",
    bgColor: "bg-error-500/10",
    borderColor: "border-error-500/30",
    textColor: "text-error-400",
    iconBg: "bg-error-500/20",
  },
  info: {
    icon: "ℹ️",
    bgColor: "bg-primary-500/10",
    borderColor: "border-primary-500/30",
    textColor: "text-primary-400",
    iconBg: "bg-primary-500/20",
  },
  success: {
    icon: "✅",
    bgColor: "bg-success-500/10",
    borderColor: "border-success-500/30",
    textColor: "text-success-400",
    iconBg: "bg-success-500/20",
  },
};

export function Notification({
  type,
  title,
  message,
  onClose,
  className = "",
  autoClose = false,
  duration = 5000,
}: NotificationProps) {
  const config = notificationConfig[type];

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className} animate-slide-up`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className="text-lg">{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-sm font-semibold ${config.textColor} mb-1`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${config.textColor} leading-relaxed`}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded hover:bg-industrial-800/50 transition-colors ${config.textColor} opacity-70 hover:opacity-100`}
          aria-label={t("settings.closeNotification")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

