
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LeadsChart = React.lazy(() => 
  import("@/components/LeadsChart").then(module => ({ default: module.LeadsChart }))
);

interface LazyLeadsChartProps {
  leads: any[];
}

const ChartSkeleton = () => (
  <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-gray-100">
        <Skeleton className="h-6 w-64 bg-gray-700" />
      </CardTitle>
      <Skeleton className="h-4 w-32 bg-gray-700" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-80 w-full bg-gray-700" />
    </CardContent>
  </Card>
);

export const LazyLeadsChart = React.memo(({ leads }: LazyLeadsChartProps) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LeadsChart leads={leads} />
  </Suspense>
));

LazyLeadsChart.displayName = 'LazyLeadsChart';
