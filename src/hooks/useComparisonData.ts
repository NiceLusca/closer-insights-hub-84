
import { useMemo } from 'react';
import { filterLeads } from "@/utils/dataFilters";
import { calculateMetrics } from "@/utils/metricsCalculations";
import { generateComparisonInsights } from "@/utils/comparisonUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead, DateRange } from "@/types/lead";

interface ComparisonParams {
  allLeads: Lead[];
  comparisonType: 'temporal' | 'origem';
  selectedPeriods: { period1: DateRange; period2: DateRange };
  selectedOrigins: string[];
}

// Função auxiliar para gerar nomes descritivos dos períodos
const getPeriodName = (dateRange: DateRange): string => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Verifica se é o mês atual completo
  if (dateRange.from.getTime() === startOfCurrentMonth.getTime() && 
      dateRange.to.getTime() === endOfCurrentMonth.getTime()) {
    return "Este Mês";
  }
  
  // Verifica se é o mês passado completo
  if (dateRange.from.getTime() === startOfLastMonth.getTime() && 
      dateRange.to.getTime() === endOfLastMonth.getTime()) {
    return "Mês Passado";
  }
  
  // Verifica se é um mês completo
  const isFullMonth = dateRange.from.getDate() === 1 && 
                     dateRange.to.getDate() === new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate();
  
  if (isFullMonth) {
    return format(dateRange.from, "MMMM 'de' yyyy", { locale: ptBR });
  }
  
  // Para períodos customizados, retorna as datas
  return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
};

export function useComparisonData({
  allLeads,
  comparisonType,
  selectedPeriods,
  selectedOrigins
}: ComparisonParams) {
  return useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      return {
        comparisonData: null,
        insights: [],
        isComparing: false
      };
    }

    console.log('🔄 [COMPARISON] Processando dados comparativos:', {
      type: comparisonType,
      totalLeads: allLeads.length,
      periods: selectedPeriods
    });

    let data1: Lead[] = [];
    let data2: Lead[] = [];
    let label1 = '';
    let label2 = '';

    switch (comparisonType) {
      case 'temporal':
        data1 = filterLeads(allLeads, selectedPeriods.period1, { status: [], closer: [], origem: [] });
        data2 = filterLeads(allLeads, selectedPeriods.period2, { status: [], closer: [], origem: [] });
        label1 = getPeriodName(selectedPeriods.period1);
        label2 = getPeriodName(selectedPeriods.period2);
        break;

      case 'origem':
        if (selectedOrigins.length >= 2) {
          data1 = allLeads.filter(lead => lead.origem === selectedOrigins[0]);
          data2 = allLeads.filter(lead => lead.origem === selectedOrigins[1]);
          label1 = selectedOrigins[0];
          label2 = selectedOrigins[1];
        }
        break;
    }

    const metrics1 = calculateMetrics(data1);
    const metrics2 = calculateMetrics(data2);

    const comparisonData = {
      dataset1: { data: data1, metrics: metrics1, label: label1 },
      dataset2: { data: data2, metrics: metrics2, label: label2 },
      type: comparisonType
    };

    const insights = generateComparisonInsights(metrics1, metrics2, comparisonType, label1, label2);

    console.log('✅ [COMPARISON] Dados processados:', {
      data1Count: data1.length,
      data2Count: data2.length,
      insightsCount: insights.length
    });

    return {
      comparisonData,
      insights,
      isComparing: false
    };
  }, [allLeads, comparisonType, selectedPeriods, selectedOrigins]);
}
