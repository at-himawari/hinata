# hinata

あたたかい雰囲気で一日を残せる、ローカル保存中心の日記アプリです。

## App

開発サーバー:

```bash
npm run dev
```

Web Push をつなぐときは、ビルド時に次の公開環境変数が必要です。

```bash
NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL=YOUR_LAMBDA_FUNCTION_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
```

### 公開環境変数の取得方法

`NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL`

- これは購読登録用 Lambda Function URL です
- CDK デプロイ後の output に `RegisterSubscriptionUrl` として表示されます
- 例:

```bash
Outputs:
HinataNotificationStack.RegisterSubscriptionUrl = https://xxxx.lambda-url.ap-northeast-1.on.aws/
```

- この値をそのまま `NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL` に入れます

`NEXT_PUBLIC_VAPID_PUBLIC_KEY`

- これは Web Push 用の VAPID 公開鍵です
- `cdk deploy` のときに指定した `-c vapidPublicKey=...` の値と同じです
- まだ鍵を作っていない場合は、次で生成できます

```bash
npx web-push generate-vapid-keys
```

- 出力される `Public Key` を `NEXT_PUBLIC_VAPID_PUBLIC_KEY` に入れます
- `Private Key` は公開せず、CDK デプロイ時の `vapidPrivateKey` にだけ使います

ローカル開発では `.env.local` に置くと扱いやすいです。

```bash
NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL=https://xxxx.lambda-url.ap-northeast-1.on.aws/
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
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
- フロント側の Web Push は `NEXT_PUBLIC_PUSH_SUBSCRIPTION_URL` と `NEXT_PUBLIC_VAPID_PUBLIC_KEY` を使って接続します
