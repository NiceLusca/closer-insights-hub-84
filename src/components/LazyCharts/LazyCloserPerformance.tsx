
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CloserPerformance = React.lazy(() => 
  import("@/components/CloserPerformance").then(module => ({ default: module.CloserPerformance }))
);

interface LazyCloserPerformanceProps {
  leads: any[];
}

const ChartSkeleton = () => (
  <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-gray-100">
        <Skeleton className="h-6 w-48 bg-gray-700" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-80 w-full bg-gray-700" />
    </CardContent>
  </Card>
);

export const LazyCloserPerformance = React.memo(({ leads }: LazyCloserPerformanceProps) => (
  <Suspense fallback={<ChartSkeleton />}>
    <CloserPerformance leads={leads} />
  </Suspense>
));

LazyCloserPerformance.displayName = 'LazyCloserPerformance';
