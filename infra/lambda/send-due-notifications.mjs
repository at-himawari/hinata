import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import webpush from "web-push";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function getCurrentSlot(timezone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(new Date());
}

function getTodayKey(timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export async function handler() {
  const tableName = process.env.TABLE_NAME;
  const slotIndexName = process.env.SLOT_INDEX_NAME;
  const timezone = process.env.DEFAULT_TIMEZONE ?? "Asia/Tokyo";
  const siteOrigin = process.env.SITE_ORIGIN ?? "https://hinata.at-himawari.com";
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:notifications@at-himawari.com";

  if (!tableName || !slotIndexName) {
    throw new Error("TABLE_NAME and SLOT_INDEX_NAME are required");
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("Skipping push send because VAPID keys are missing.");
    return { ok: true, skipped: true, reason: "missing-vapid-keys" };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const notificationTime = getCurrentSlot(timezone);
  const notificationSlot = `${timezone}#${notificationTime}`;
  const todayKey = getTodayKey(timezone);

  const response = await client.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: slotIndexName,
      KeyConditionExpression: "notificationSlot = :slot",
      ExpressionAttributeValues: {
        ":slot": notificationSlot,
      },
    }),
  );

  const dueSubscriptions = (response.Items ?? []).filter(
    (item) => item.enabled !== false && item.lastNotifiedOn !== todayKey,
  );

  const results = await Promise.allSettled(
    dueSubscriptions.map(async (item) => {
      await webpush.sendNotification(
        {
          endpoint: item.endpoint,
          keys: {
            p256dh: item.p256dh,
            auth: item.auth,
          },
        },
        JSON.stringify({
          title: "hinata",
          body: "そろそろ、今日のひとことを残してみませんか。",
          url: siteOrigin,
        }),
      );

      await client.send(
        new UpdateCommand({
          TableName: tableName,
          Key: {
            subscriptionId: item.subscriptionId,
          },
          UpdateExpression:
            "SET lastNotifiedAt = :lastNotifiedAt, lastNotifiedOn = :lastNotifiedOn, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":lastNotifiedAt": new Date().toISOString(),
            ":lastNotifiedOn": todayKey,
            ":updatedAt": new Date().toISOString(),
          },
        }),
      );

      return item.subscriptionId;
    }),
  );

  return {
    ok: true,
    notificationSlot,
    targeted: dueSubscriptions.length,
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}
