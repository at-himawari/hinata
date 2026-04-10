import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import {
  HttpMethod,
  FunctionUrlAuthType,
  Runtime,
  Code,
  Function as LambdaFunction,
} from "aws-cdk-lib/aws-lambda";
import { CfnSchedule } from "aws-cdk-lib/aws-scheduler";
import {
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lambdaRoot = path.join(__dirname, "../lambda");

export class HinataNotificationStack extends cdk.Stack {
  constructor(scope, id, props = {}) {
    super(scope, id, props);

    const siteOrigin = this.node.tryGetContext("siteOrigin") ?? "https://hinata.at-himawari.com";
    const localOrigin = this.node.tryGetContext("localOrigin") ?? "http://localhost:3000";
    const defaultTimezone = this.node.tryGetContext("defaultTimezone") ?? "Asia/Tokyo";
    const vapidPublicKey = this.node.tryGetContext("vapidPublicKey") ?? "";
    const vapidPrivateKey = this.node.tryGetContext("vapidPrivateKey") ?? "";
    const vapidSubject =
      this.node.tryGetContext("vapidSubject") ?? "mailto:notifications@at-himawari.com";

    const subscriptionsTable = new Table(this, "PushSubscriptionsTable", {
      tableName: "hinata-push-subscriptions",
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "subscriptionId", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    subscriptionsTable.addGlobalSecondaryIndex({
      indexName: "byNotificationSlot",
      partitionKey: { name: "notificationSlot", type: AttributeType.STRING },
      sortKey: { name: "subscriptionId", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const registerSubscriptionLogGroup = new LogGroup(this, "RegisterSubscriptionLogGroup", {
      retention: RetentionDays.ONE_WEEK,
    });

    const registerSubscriptionFn = new LambdaFunction(this, "RegisterSubscriptionFn", {
      runtime: Runtime.NODEJS_20_X,
      handler: "register-subscription.handler",
      code: Code.fromAsset(lambdaRoot),
      timeout: cdk.Duration.seconds(10),
      logGroup: registerSubscriptionLogGroup,
      environment: {
        TABLE_NAME: subscriptionsTable.tableName,
        DEFAULT_TIMEZONE: defaultTimezone,
        ALLOWED_ORIGINS: JSON.stringify([siteOrigin, localOrigin]),
      },
    });

    subscriptionsTable.grantReadWriteData(registerSubscriptionFn);

    const registrationUrl = registerSubscriptionFn.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: [siteOrigin, localOrigin],
        allowedMethods: [HttpMethod.POST, HttpMethod.DELETE],
        allowedHeaders: ["content-type"],
      },
    });

    const sendDueNotificationsLogGroup = new LogGroup(this, "SendDueNotificationsLogGroup", {
      retention: RetentionDays.ONE_WEEK,
    });

    const sendDueNotificationsFn = new LambdaFunction(this, "SendDueNotificationsFn", {
      runtime: Runtime.NODEJS_20_X,
      handler: "send-due-notifications.handler",
      code: Code.fromAsset(lambdaRoot),
      timeout: cdk.Duration.seconds(30),
      logGroup: sendDueNotificationsLogGroup,
      environment: {
        TABLE_NAME: subscriptionsTable.tableName,
        SLOT_INDEX_NAME: "byNotificationSlot",
        DEFAULT_TIMEZONE: defaultTimezone,
        SITE_ORIGIN: siteOrigin,
        VAPID_PUBLIC_KEY: vapidPublicKey,
        VAPID_PRIVATE_KEY: vapidPrivateKey,
        VAPID_SUBJECT: vapidSubject,
      },
    });

    subscriptionsTable.grantReadWriteData(sendDueNotificationsFn);

    sendDueNotificationsFn.addToRolePolicy(
      new PolicyStatement({
        actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        resources: ["*"],
      }),
    );

    const schedulerRole = new Role(this, "SendDueNotificationsSchedulerRole", {
      assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
    });

    sendDueNotificationsFn.grantInvoke(schedulerRole);

    new CfnSchedule(this, "SendDueNotificationsSchedule", {
      description: "Runs every 5 minutes and sends due web push notifications for hinata.",
      flexibleTimeWindow: {
        mode: "OFF",
      },
      scheduleExpression: "rate(5 minutes)",
      scheduleExpressionTimezone: defaultTimezone,
      target: {
        arn: sendDueNotificationsFn.functionArn,
        roleArn: schedulerRole.roleArn,
      },
    });

    new cdk.CfnOutput(this, "PushSubscriptionsTableName", {
      value: subscriptionsTable.tableName,
    });

    new cdk.CfnOutput(this, "RegisterSubscriptionUrl", {
      value: registrationUrl.url,
    });

    new cdk.CfnOutput(this, "WebPushReady", {
      value:
        vapidPublicKey && vapidPrivateKey
          ? "VAPID keys configured"
          : "Set vapidPublicKey and vapidPrivateKey via CDK context before deploy",
    });
  }
}
