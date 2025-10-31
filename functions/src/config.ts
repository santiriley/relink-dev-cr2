import { defineSecret } from 'firebase-functions/params';

export const TELEMETRY_INGEST_TOKEN = defineSecret('TELEMETRY_INGEST_TOKEN');
export const WHATSAPP_VERIFY_TOKEN  = defineSecret('WHATSAPP_VERIFY_TOKEN');
export const REPORT_SALT            = defineSecret('REPORT_SALT');
