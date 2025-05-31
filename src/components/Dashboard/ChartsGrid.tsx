
import React from 'react';
import { LazyLeadsChart } from "@/components/LazyCharts/LazyLeadsChart";
import { LazyRevenueChart } from "@/components/LazyCharts/LazyRevenueChart";
import { LazyStatusDistribution } from "@/components/LazyCharts/LazyStatusDistribution";
import { LazyCloserPerformance } from "@/components/LazyCharts/LazyCloserPerformance";
import type { Lead } from "@/types/lead";

interface ChartsGridProps {
  leads: Lead[];
}

export const ChartsGrid = React.memo(({ leads }: ChartsGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <LazyLeadsChart leads={leads} />
      <LazyRevenueChart leads={leads} />
      <LazyStatusDistribution leads={leads} />
      <LazyCloserPerformance leads={leads} />
    </div>
  );
});

ChartsGrid.displayName = 'ChartsGrid';
