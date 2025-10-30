"use client";

import type { Community, Aggregate } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CommunityTableProps {
  communities: Community[];
  aggregates: Aggregate[];
}

export function CommunityTable({
  communities,
  aggregates,
}: CommunityTableProps) {
  const getLatestMetrics = (communityId: string) => {
    const communityAggregates = aggregates
      .filter((agg) => agg.communityId === communityId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return communityAggregates[0] || null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Community Overview</CardTitle>
        <CardDescription>
          Latest reliability metrics for each community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Community</TableHead>
              <TableHead className="text-right">SAIDI (hrs)</TableHead>
              <TableHead className="text-right">SAIFI (events)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.map((community) => {
              const latest = getLatestMetrics(community.id);
              const saidi = latest?.saidiHours ?? 0;
              const saifi = latest?.saifiEvents ?? 0;
              
              const getSaidiColor = (val: number) => {
                if (val > 5) return 'bg-red-500';
                if (val > 2) return 'bg-yellow-500';
                return 'bg-green-500';
              }

              const getSaifiColor = (val: number) => {
                if (val > 3) return 'bg-red-500';
                if (val > 1) return 'bg-yellow-500';
                return 'bg-green-500';
              }

              return (
                <TableRow key={community.id}>
                  <TableCell>
                    <div className="font-medium">{community.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {community.country}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      <span className={`mr-2 h-2 w-2 rounded-full ${getSaidiColor(saidi)}`}></span>
                      {saidi.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      <span className={`mr-2 h-2 w-2 rounded-full ${getSaifiColor(saifi)}`}></span>
                      {saifi}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
