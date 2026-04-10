# hinata

あたたかい雰囲気で一日を残せる、ローカル保存中心の日記アプリです。

## App

開発サーバー:

```bash
npm run dev
```

検証:

```bash
npm run lint
npx next build --webpack
```

## Infra

`infra/` には Web Push 用の AWS CDK 構成が入っています。今の構成は次の前提です。

- 日記本文はブラウザ保存
- 通知購読情報だけを `DynamoDB` に保存
- 購読登録APIは `Lambda Function URL`
- 定時送信は `EventBridge` から `Lambda`

### 作成されるもの

- `hinata-push-subscriptions` DynamoDB テーブル
- 購読登録用 Lambda
- 定時送信用 Lambda
- 5分おき実行の EventBridge ルール

### 初回セットアップ

```bash
npm run infra:install
```

### デプロイ

```bash
cd infra
npx cdk bootstrap
npx cdk deploy --require-approval never \
  -c siteOrigin=https://hinata.at-himawari.com \
  -c localOrigin=http://localhost:3000 \
  -c defaultTimezone=Asia/Tokyo \
  -c vapidPublicKey=YOUR_VAPID_PUBLIC_KEY \
  -c vapidPrivateKey=YOUR_VAPID_PRIVATE_KEY \
  -c vapidSubject=mailto:notifications@at-himawari.com
```

### ルートから一発でデプロイ

```bash
npm run infra:deploy -- \
  -c siteOrigin=https://hinata.at-himawari.com \
  -c localOrigin=http://localhost:3000 \
  -c defaultTimezone=Asia/Tokyo \
  -c vapidPublicKey=YOUR_VAPID_PUBLIC_KEY \
  -c vapidPrivateKey=YOUR_VAPID_PRIVATE_KEY \
  -c vapidSubject=mailto:notifications@at-himawari.com
```

### メモ

- 現状の通知スロット判定は `Asia/Tokyo` 前提で始めやすい構成です
- VAPID キー未設定でもデプロイはできますが、送信Lambdaはスキップ動作になります
- PWA と Push Subscription のフロント実装はこれから接続する前提です
