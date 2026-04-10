"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/db/settings";
import { canSendNotifications, buildNotificationBody } from "@/lib/notifications";

export function NotificationScheduler() {
  useEffect(() => {
    async function maybeNotify() {
      if (!canSendNotifications()) {
        return;
      }

      const settings = await getSettings();

      if (!settings.notificationEnabled) {
        return;
      }

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      if (currentTime !== settings.notificationTime) {
        return;
      }

      const notifiedKey = `hinata:last-notified:${settings.notificationTime}`;
      const today = now.toISOString().slice(0, 10);

      if (window.localStorage.getItem(notifiedKey) === today) {
        return;
      }

      new Notification("hinata", {
        body: buildNotificationBody(),
      });
      window.localStorage.setItem(notifiedKey, today);
    }

    void maybeNotify();
    const intervalId = window.setInterval(() => {
      void maybeNotify();
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
