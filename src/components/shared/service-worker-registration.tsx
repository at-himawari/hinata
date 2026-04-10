"use client";

import { useEffect } from "react";
import { registerNotificationServiceWorker } from "@/lib/notifications";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    void registerNotificationServiceWorker().catch(() => {
      // Notification support depends on platform and install mode, so failures are handled in UI.
    });
  }, []);

  return null;
}
