# RE-Link

RE-Link turns verified energy reliability data into deployable micro-grid insights. This project consists of a Next.js frontend for displaying reliability dashboards and a Firebase backend for data ingestion and processing.

## Quickstart

### 1. Set Project ID
First, edit the `.firebaserc` file and replace `"REPLACE_ME"` with your actual Firebase Project ID.

Then, set the environment variable:
```bash
PROJECT_ID=<YOUR_PROJECT_ID>
```

### 2. Set Secrets
Create and set secrets for the telemetry ingest token and WhatsApp verification token. These commands are non-interactive.

```bash
# 1) set project id (edit .firebaserc first to real id)
PROJECT_ID=<YOUR_PROJECT_ID>

# 2) set secrets non-interactively
printf 'super-secret-telemetry-token-123' > .telemetry.secret
printf 'super-secret-whatsapp-token-456'  > .whatsapp.secret
firebase functions:secrets:set TELEMETRY_INGEST_TOKEN --project "$PROJECT_ID" --data-file ./.telemetry.secret
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN  --project "$PROJECT_ID" --data-file ./.whatsapp.secret
rm .telemetry.secret .whatsapp.secret

# 3) deploy
firebase deploy --only functions --project "$PROJECT_ID"
```

### 3. Deploy
Deploy the Firebase functions and Firestore rules.

```bash
firebase deploy --project "$PROJECT_ID"
```

## Important Notes
- Before deploying, ensure you have enabled the **Cloud Scheduler API** and **Secret Manager API** in your Google Cloud project.
- The backend functions are located in the `/functions` directory (not included in this scaffold, must be created separately per the backend specification).

## Sample API Calls

### Ingest Telemetry Data
```bash
curl -X POST https://<YOUR_REGION>-<YOUR_PROJECT_ID>.cloudfunctions.net/ingestTelemetry \
-H "Content-Type: application/json" \
-H "x-api-key: super-secret-telemetry-token-123" \
-d '{
  "communityId": "costa-rica-demo",
  "ts": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "voltage": 215.5,
  "source": "iot"
}'
```

### Trigger Manual Aggregation
```bash
curl https://<YOUR_REGION>-<YOUR_PROJECT_ID>.cloudfunctions.net/aggregateNow
```
