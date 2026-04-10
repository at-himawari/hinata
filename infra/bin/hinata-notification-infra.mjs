#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { HinataNotificationStack } from "../lib/hinata-notification-stack.mjs";

const app = new cdk.App();

new HinataNotificationStack(app, "HinataNotificationStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1",
  },
});
