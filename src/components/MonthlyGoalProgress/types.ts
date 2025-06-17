
export interface MonthlyData {
  monthlyRevenue: number;
  goal: number;
  progress: number;
  remaining: number;
  leadsCount: number;
  vendasCompletas: number;
  vendasRecorrentes: number;
  closerContributions: [string, CloserContribution][];
}

export interface CloserContribution {
  revenue: number;
  salesCount: number;
  percentage: number;
  vendasCompletas: number;
  vendasRecorrentes: number;
}
