import crypto from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function buildSlot(notificationTime, timezone) {
  return `${timezone}#${notificationTime}`;
}

export async function handler(event) {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return json(204, {});
  }

  const tableName = process.env.TABLE_NAME;
  const defaultTimezone = process.env.DEFAULT_TIMEZONE ?? "Asia/Tokyo";

  if (!tableName) {
    return json(500, { message: "TABLE_NAME is missing" });
  }

  if (!event.body) {
    return json(400, { message: "Request body is required" });
  }

  const payload = JSON.parse(event.body);

  if (event.requestContext?.http?.method === "DELETE") {
    if (!payload.subscriptionId) {
      return json(400, { message: "subscriptionId is required" });
    }

    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          subscriptionId: payload.subscriptionId,
        },
      }),
    );

    return json(200, { ok: true });
  }

  const subscription = payload.subscription;
  const notificationTime = payload.notificationTime ?? "21:00";
  const timezone = payload.timezone ?? defaultTimezone;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return json(400, { message: "Valid push subscription is required" });
  }

  const subscriptionId =
    payload.subscriptionId ??
    crypto.createHash("sha256").update(subscription.endpoint).digest("hex");
  const now = new Date().toISOString();

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        subscriptionId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "unknown",
        timezone,
        notificationTime,
        notificationSlot: buildSlot(notificationTime, timezone),
        enabled: payload.enabled ?? true,
        createdAt: payload.createdAt ?? now,
        updatedAt: now,
      },
    }),
  );

  return json(200, { ok: true, subscriptionId });
}
