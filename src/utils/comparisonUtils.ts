
import type { Metrics } from "@/types/lead";

export interface ComparisonInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  metric: string;
  value: number;
}

export function generateComparisonInsights(
  metrics1: Metrics,
  metrics2: Metrics,
  comparisonType: string,
  label1: string,
  label2: string
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  // Calculate percentage differences
  const leadsDiff = calculatePercentageDiff(metrics1.totalLeads, metrics2.totalLeads);
  const revenueDiff = calculatePercentageDiff(metrics1.receitaTotal, metrics2.receitaTotal);
  const closingRateDiff = calculatePercentageDiff(metrics1.taxaFechamento, metrics2.taxaFechamento);
  const ticketDiff = calculatePercentageDiff(metrics1.ticketMedio, metrics2.ticketMedio);
  const attendanceRateDiff = calculatePercentageDiff(metrics1.taxaComparecimento, metrics2.taxaComparecimento);

  // Generate insights based on significant differences
  if (Math.abs(leadsDiff) > 10) {
    insights.push({
      type: leadsDiff > 0 ? 'positive' : 'negative',
      title: `${leadsDiff > 0 ? 'Aumento' : 'Redução'} significativo em leads`,
      description: `${label1} teve ${Math.abs(leadsDiff).toFixed(1)}% ${leadsDiff > 0 ? 'mais' : 'menos'} leads que ${label2}`,
      metric: 'totalLeads',
      value: leadsDiff
    });
  }

  if (Math.abs(revenueDiff) > 15) {
    insights.push({
      type: revenueDiff > 0 ? 'positive' : 'negative',
      title: `Performance de receita ${revenueDiff > 0 ? 'superior' : 'inferior'}`,
      description: `${label1} gerou ${Math.abs(revenueDiff).toFixed(1)}% ${revenueDiff > 0 ? 'mais' : 'menos'} receita que ${label2}`,
      metric: 'receitaTotal',
      value: revenueDiff
    });
  }

  if (Math.abs(closingRateDiff) > 5) {
    insights.push({
      type: closingRateDiff > 0 ? 'positive' : 'negative',
      title: `Taxa de fechamento ${closingRateDiff > 0 ? 'melhor' : 'pior'}`,
      description: `${label1} teve taxa de fechamento ${Math.abs(closingRateDiff).toFixed(1)}% ${closingRateDiff > 0 ? 'maior' : 'menor'} que ${label2}`,
      metric: 'taxaFechamento',
      value: closingRateDiff
    });
  }

  if (Math.abs(ticketDiff) > 20) {
    insights.push({
      type: ticketDiff > 0 ? 'positive' : 'negative',
      title: `Ticket médio ${ticketDiff > 0 ? 'superior' : 'inferior'}`,
      description: `${label1} teve ticket médio ${Math.abs(ticketDiff).toFixed(1)}% ${ticketDiff > 0 ? 'maior' : 'menor'} que ${label2}`,
      metric: 'ticketMedio',
      value: ticketDiff
    });
  }

  if (Math.abs(attendanceRateDiff) > 10) {
    insights.push({
      type: attendanceRateDiff > 0 ? 'positive' : 'negative',
      title: `Taxa de comparecimento ${attendanceRateDiff > 0 ? 'melhor' : 'pior'}`,
      description: `${label1} teve taxa de comparecimento ${Math.abs(attendanceRateDiff).toFixed(1)}% ${attendanceRateDiff > 0 ? 'maior' : 'menor'} que ${label2}`,
      metric: 'taxaComparecimento',
      value: attendanceRateDiff
    });
  }

  // Add efficiency insights
  const efficiency1 = calculateEfficiency(metrics1);
  const efficiency2 = calculateEfficiency(metrics2);
  const efficiencyDiff = calculatePercentageDiff(efficiency1, efficiency2);

  if (Math.abs(efficiencyDiff) > 10) {
    insights.push({
      type: efficiencyDiff > 0 ? 'positive' : 'neutral',
      title: `Eficiência operacional ${efficiencyDiff > 0 ? 'superior' : 'diferente'}`,
      description: `${label1} demonstrou ${Math.abs(efficiencyDiff).toFixed(1)}% ${efficiencyDiff > 0 ? 'mais' : 'menos'} eficiência que ${label2}`,
      metric: 'efficiency',
      value: efficiencyDiff
    });
  }

  return insights;
}

function calculatePercentageDiff(value1: number, value2: number): number {
  if (value2 === 0) return value1 > 0 ? 100 : 0;
  return ((value1 - value2) / value2) * 100;
}

function calculateEfficiency(metrics: Metrics): number {
  // Custom efficiency calculation based on conversion rates and revenue per lead
  const revenuePerLead = metrics.totalLeads > 0 ? metrics.receitaTotal / metrics.totalLeads : 0;
  const conversionEfficiency = (metrics.taxaFechamento + metrics.taxaComparecimento) / 2;
  return revenuePerLead * (conversionEfficiency / 100);
}

export function formatComparisonValue(value: number, type: 'percentage' | 'currency' | 'number'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0
      }).format(value);
    case 'number':
      return value.toString();
    default:
      return value.toString();
  }
}
