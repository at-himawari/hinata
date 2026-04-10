const SUBSCRIPTION_ID_KEY = "hinata:push-subscription-id";

type PushSupportStatus = {
  supported: boolean;
  message: string;
};

function isIos(userAgent: string) {
  return /iPhone|iPad|iPod/i.test(userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    // Safari on iOS exposes this property in standalone mode.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function getPublicSubscriptionConfig() {
  const endpoint = process.env.NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!endpoint || !vapidPublicKey) {
    throw new Error(
      "NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL と NEXT_PUBLIC_VAPID_PUBLIC_KEY が必要です",
    );
  }

  return { endpoint, vapidPublicKey };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replaceAll("-", "+").replaceAll("_", "/");
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Notification API request failed: ${response.status}`);
  }

  return response.json() as Promise<{ ok?: boolean; subscriptionId?: string }>;
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function getPushSupportStatus(): PushSupportStatus {
  if (typeof window === "undefined") {
    return { supported: false, message: "この環境では通知を確認できません" };
  }

  const userAgent = window.navigator.userAgent;

  if (!window.isSecureContext) {
    return { supported: false, message: "通知を使うには HTTPS で開く必要があります" };
  }

  if (isIos(userAgent) && !isStandaloneMode()) {
    return {
      supported: false,
      message:
        "iPhoneでは、Safariの共有メニューから「ホーム画面に追加」したあと、ホーム画面の hinata から開く必要があります。",
    };
  }

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return {
      supported: false,
      message: "このブラウザでは Web Push 通知に対応していません",
    };
  }

  return {
    supported: true,
    message: "この端末では Web Push 通知を使えます",
  };
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
}

export async function registerNotificationServiceWorker() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    throw new Error(support.message);
  }

  return navigator.serviceWorker.register("/sw.js");
}

export async function syncPushSubscription(options: {
  notificationTime: string;
  enabled: boolean;
}) {
  const support = getPushSupportStatus();

  if (!support.supported) {
    throw new Error(support.message);
  }

  if (getNotificationPermission() !== "granted") {
    throw new Error("先にブラウザ通知を許可してください");
  }

  const { endpoint, vapidPublicKey } = getPublicSubscriptionConfig();
  const registration = await registerNotificationServiceWorker();

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const response = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      subscriptionId: window.localStorage.getItem(SUBSCRIPTION_ID_KEY) ?? undefined,
      notificationTime: options.notificationTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      enabled: options.enabled,
    }),
  });

  if (response.subscriptionId) {
    window.localStorage.setItem(SUBSCRIPTION_ID_KEY, response.subscriptionId);
  }

  return response;
}

export async function disablePushSubscription() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    return;
  }

  const { endpoint } = getPublicSubscriptionConfig();
  const registration = await registerNotificationServiceWorker();
  const subscription = await registration.pushManager.getSubscription();
  const subscriptionId = window.localStorage.getItem(SUBSCRIPTION_ID_KEY);

  if (subscriptionId) {
    await fetchJson(endpoint, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });
    window.localStorage.removeItem(SUBSCRIPTION_ID_KEY);
  }

  await subscription?.unsubscribe();
}

export function canSendNotifications() {
  return getPushSupportStatus().supported && getNotificationPermission() === "granted";
}

export function buildNotificationBody() {
  return "そろそろ、今日のひとことを残してみませんか。";
}
