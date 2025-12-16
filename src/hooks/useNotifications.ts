/** Hook for managing notifications */

import { useState, useCallback } from "react";
import type { NotificationItem, NotificationType } from "../components/design-system/NotificationContainer";

let notificationIdCounter = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      options?: {
        title?: string;
        autoClose?: boolean;
        duration?: number;
      }
    ) => {
      const id = `notification-${++notificationIdCounter}`;
      const notification: NotificationItem = {
        id,
        type,
        message,
        title: options?.title,
        autoClose: options?.autoClose ?? true,
        duration: options?.duration ?? 5000,
      };

      setNotifications((prev) => [...prev, notification]);
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showWarning = useCallback(
    (message: string, title?: string) => {
      return addNotification("warning", message, { title, autoClose: true, duration: 5000 });
    },
    [addNotification]
  );

  const showCritical = useCallback(
    (message: string, title?: string) => {
      return addNotification("critical", message, { title, autoClose: true, duration: 7000 });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      return addNotification("info", message, { title, autoClose: true, duration: 4000 });
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      return addNotification("success", message, { title, autoClose: true, duration: 3000 });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showWarning,
    showCritical,
    showInfo,
    showSuccess,
  };
}

