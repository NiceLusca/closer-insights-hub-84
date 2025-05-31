
import React from 'react';
import { LeadsChart } from "@/components/LeadsChart";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusDistribution } from "@/components/StatusDistribution";
import { CloserPerformance } from "@/components/CloserPerformance";
import type { Lead } from "@/types/lead";

interface ChartsGridProps {
  leads: Lead[];
}

export function ChartsGrid({ leads }: ChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <LeadsChart leads={leads} />
      <RevenueChart leads={leads} />
      <StatusDistribution leads={leads} />
      <CloserPerformance leads={leads} />
    </div>
  );
}
