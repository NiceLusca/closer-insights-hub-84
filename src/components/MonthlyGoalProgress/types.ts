
export interface MonthlyData {
  monthlyRevenue: number;
  goal: number;
  progress: number;
  remaining: number;
  leadsCount: number;
  closerContributions: [string, CloserContribution][];
}

export interface CloserContribution {
  revenue: number;
  salesCount: number;
  percentage: number;
}
