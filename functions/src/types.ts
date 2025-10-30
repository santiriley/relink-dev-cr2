export type Telemetry = {
  communityId: string; ts: string;
  voltage?: number; frequency?: number; uptime?: number; kWh?: number;
  source: 'iot'|'manual'|'mock'; deviceId?: string;
};
export type Outage = {
  communityId: string; startedAt: string; endedAt?: string|null;
  source: 'whatsapp'|'sensor'|'manual'; notes?: string;
};
