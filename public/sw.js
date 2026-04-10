self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "hinata", {
      body: payload.body ?? "そろそろ、今日のひとことを残してみませんか。",
      icon: "/apple-touch-icon.png",
      badge: "/apple-touch-icon.png",
      data: {
        url: payload.url ?? "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const targetUrl = event.notification.data?.url ?? "/";
      const existingClient = clientList.find((client) => "focus" in client);

      if (existingClient) {
        existingClient.navigate(targetUrl);
        return existingClient.focus();
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
