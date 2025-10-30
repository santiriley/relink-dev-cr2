// This file contains mock data to simulate what would be in Firestore.

export type Community = {
  id: string;
  name: string;
  country: string;
  muni?: string;
  lat: number;
  lng: number;
  households?: number;
};

export type Aggregate = {
  date: string; // YYYY-MM-DD
  ts: string; // ISO string for sorting, same as date
  communityId: string;
  saidiHours: number;
  saifiEvents: number;
  voltageDipCount: number;
  dieselKWhEst: number;
  hhAffordabilityPct: null | number;
};

export const communities: Community[] = [
  {
    id: "costa-rica-demo",
    name: "Poás",
    country: "CR",
    muni: "Poás",
    lat: 10.1,
    lng: -84.2,
    households: 500,
  },
  {
    id: "puerto-rico-test",
    name: "Vieques",
    country: "PR",
    muni: "Vieques",
    lat: 18.1,
    lng: -65.4,
    households: 1250,
  },
  {
    id: "nigeria-rural",
    name: "Kaduna Solar",
    country: "NG",
    muni: "Kaduna",
    lat: 10.5,
    lng: 7.4,
    households: 800,
  },
];

// Generate mock aggregate data for the last 30 days
const generateAggregates = (): Aggregate[] => {
  const data: Aggregate[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    for (const community of communities) {
        // Introduce some variance based on community
        const baseSaidi = community.id.includes('rico') ? 1.5 : 0.5;
        const baseSaifi = community.id.includes('rico') ? 2 : 1;
        const baseVoltageDips = community.id.includes('rico') ? 10 : 5;

        // Add some noise and weekly patterns
        const dayOfWeek = date.getDay();
        const randomFactor = Math.random() + 0.5;
        const weeklySpike = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.5 : 1; // Weekend spike

        data.push({
            date: dateString,
            ts: date.toISOString(),
            communityId: community.id,
            saidiHours: parseFloat((baseSaidi * randomFactor * weeklySpike).toFixed(2)),
            saifiEvents: Math.round(baseSaifi * randomFactor * weeklySpike * (Math.random() < 0.3 ? 2 : 1)),
            voltageDipCount: Math.round(baseVoltageDips * randomFactor),
            dieselKWhEst: 0,
            hhAffordabilityPct: null,
        });
    }
  }
  return data;
};

export const aggregates: Aggregate[] = generateAggregates();
