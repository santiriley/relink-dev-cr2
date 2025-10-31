export type Telemetry = {
  communityId: string;
  ts: string;
  voltage?: number;
  frequency?: number;
  uptime?: number;
  kWh?: number;
  source: 'iot'|'manual'|'mock';
  deviceId?: string;
};

export type Report = {
  communityId: string;
  type: 'outage'|'brownout'|'voltage_dip';
  tsStart: string;
  tsEnd?: string|null;
  notes?: string|null;
  reporterHash: string;
  confidence: number;
  source?: 'whatsapp'|'sensor'|'manual';
};

export type DailyStats = {
  communityId: string;
  date: string; // YYYY-MM-DD
  outageCount: number;
  brownoutCount: number;
  voltageDipCount: number;
  saidiHoursProxy: number;
  saifiEventsProxy: number;
  minVoltage?: number|null;
  rriScore: number; // 0..100
  sources: 'reports'|'telemetry'|'mixed';
};
