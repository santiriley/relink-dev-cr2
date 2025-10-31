import * as logger from 'firebase-functions/logger';

export type Parsed =
  | { type: 'outage'; communityId: string; tsStart: string; tsEnd?: string|null; notes?: string; confidence: number }
  | { type: 'brownout'; communityId: string; tsStart: string; tsEnd?: string|null; notes?: string; confidence: number }
  | { type: 'voltage_dip'; communityId: string; tsStart: string; notes?: string; confidence: number };

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}
function toISOOnDate(hhmm: string, dateISO = todayISODate()) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCHours(h, m || 0, 0, 0);
  return d.toISOString();
}
function kv(text: string, key: string) {
  const m = text.match(new RegExp(`${key}=([^\\s]+)`, 'i'));
  return m?.[1];
}

export function parseWhatsAppText(textRaw: string): Parsed | null {
  const text = String(textRaw || '').trim();
  if (!text) return null;

  const communityId = kv(text, 'community') || kv(text, 'communityId') || 'costa-rica-demo';
  const notes = (kv(text, 'notes') || '').slice(0, 500);

  if (/^OUTAGE/i.test(text)) {
    const start = kv(text, 'start');
    const end   = kv(text, 'end');
    if (!start || !/^\d{1,2}:\d{2}$/.test(start)) return null;
    const tsStart = toISOOnDate(start);
    const tsEnd   = end && /^\d{1,2}:\d{2}$/.test(end) ? toISOOnDate(end) : null;
    return { type: 'outage', communityId, tsStart, tsEnd, notes, confidence: 0.85 };
  }

  if (/^BROWNOUT/i.test(text)) {
    const dur = text.match(/BROWNOUT\s+(\d+)(m|h)/i);
    const now = new Date();
    const tsStart = now.toISOString();
    let tsEnd: string | null = null;
    if (dur) {
      const n = parseInt(dur[1], 10);
      const mult = dur[2].toLowerCase() === 'h' ? 60 : 1;
      const endD = new Date(now.getTime() + n * mult * 60_000);
      tsEnd = endD.toISOString();
    }
    return { type: 'brownout', communityId, tsStart, tsEnd, notes, confidence: 0.8 };
  }

  if (/^VOLT/i.test(text)) {
    const m = text.match(/VOLT\s+(\d+(?:\.\d+)?)\s*V/i);
    const now = new Date().toISOString();
    const note = m ? `VOLT ${m[1]}V` : notes;
    return { type: 'voltage_dip', communityId, tsStart: now, notes: note, confidence: 0.6 };
  }

  logger.debug('Unrecognized text', { text });
  return null;
}
