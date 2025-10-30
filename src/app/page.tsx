import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReliabilityChart } from "@/components/dashboard/reliability-chart";
import { CommunityTable } from "@/components/dashboard/community-table";
import { communities, aggregates } from "@/lib/mock-data";
import { Building, Clock, Users, ZapOff } from "lucide-react";

export default function Home() {
  const totalHouseholds = communities.reduce(
    (acc, community) => acc + (community.households ?? 0),
    0
  );
  const totalSAIFI = aggregates.reduce((acc, agg) => acc + agg.saifiEvents, 0);
  const averageSAIDI =
    aggregates.reduce((acc, agg) => acc + agg.saidiHours, 0) /
      aggregates.length || 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Monitored Communities"
            value={communities.length}
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
            description="Total number of communities providing data."
          />
          <MetricCard
            title="Total Households"
            value={totalHouseholds.toLocaleString()}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Sum of households in all communities."
          />
          <MetricCard
            title="Total Outages (Last 30d)"
            value={totalSAIFI.toLocaleString()}
            icon={<ZapOff className="h-4 w-4 text-muted-foreground" />}
            description="SAIFI: System Average Interruption Frequency Index."
          />
          <MetricCard
            title="Avg. Outage Duration (Last 30d)"
            value={`${averageSAIDI.toFixed(2)} hrs`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description="SAIDI: System Average Interruption Duration Index."
          />
        </div>
        <div className="grid auto-rows-fr gap-4 lg:grid-cols-5">
          <div className="col-span-1 lg:col-span-3">
             <ReliabilityChart data={aggregates} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <CommunityTable communities={communities} aggregates={aggregates} />
          </div>
        </div>
      </main>
    </div>
  );
}
