
import { useMemo } from 'react';
import { filterLeads } from "@/utils/dataFilters";
import { calculateExpandedMetrics } from "@/utils/expandedMetricsCalculations";
import { generateComparisonInsights } from "@/utils/comparisonUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead, DateRange, Metrics } from "@/types/lead";

interface ExpandedComparisonParams {
  allLeads: Lead[];
  comparisonType: 'temporal' | 'origem';
  selectedPeriods: { period1: DateRange; period2: DateRange };
  selectedOrigins: string[];
}

const getPeriodName = (dateRange: DateRange): string => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  if (dateRange.from.getTime() === startOfCurrentMonth.getTime() && 
      dateRange.to.getTime() === endOfCurrentMonth.getTime()) {
    return "Este Mês";
  }
  
  if (dateRange.from.getTime() === startOfLastMonth.getTime() && 
      dateRange.to.getTime() === endOfLastMonth.getTime()) {
    return "Mês Passado";
  }
  
  const isFullMonth = dateRange.from.getDate() === 1 && 
                     dateRange.to.getDate() === new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate();
  
  if (isFullMonth) {
    return format(dateRange.from, "MMMM 'de' yyyy", { locale: ptBR });
  }
  
  return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
};

// Função auxiliar para converter ExpandedMetrics para Metrics
const convertToBasicMetrics = (expandedMetrics: any): Metrics => {
  return {
    totalLeads: expandedMetrics.totalLeads || 0,
    fechamentos: expandedMetrics.fechamentos || 0,
    receitaTotal: expandedMetrics.receitaTotal || 0,
    taxaFechamento: expandedMetrics.taxaFechamento || 0,
    taxaComparecimento: expandedMetrics.taxaComparecimento || 0,
    aproveitamentoGeral: expandedMetrics.aproveitamentoGeral || 0,
    ticketMedio: expandedMetrics.ticketMedio || 0,
    noShows: expandedMetrics.noShows || 0,
    remarcacoes: expandedMetrics.remarcacoes || 0,
    receitaRecorrente: expandedMetrics.receitaRecorrente || 0,
    receitaCompleta: expandedMetrics.receitaCompleta || 0,
    // Valores padrão para propriedades obrigatórias faltantes
    agendamentos: 0,
    confirmados: 0,
    mentorados: 0,
    vendasCompletas: expandedMetrics.vendasCompletas || 0,
    vendasRecorrentes: expandedMetrics.vendasRecorrentes || 0,
    taxaDesmarque: 0,
    taxaNaoFechamento: 0,
    fechados: expandedMetrics.fechamentos || 0,
    aSerAtendido: 0,
    atendidoNaoFechou: 0,
    perdidoInativo: 0,
    apresentacoes: 0,
    compareceram: 0
  };
};

export function useExpandedComparisonData({
  allLeads,
  comparisonType,
  selectedPeriods,
  selectedOrigins
}: ExpandedComparisonParams) {
  return useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      return {
        comparisonData: null,
        insights: [],
        isComparing: false
      };
    }

    console.log('🔄 [EXPANDED-COMPARISON] Processando dados comparativos expandidos:', {
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

    const metrics1 = calculateExpandedMetrics(data1);
    const metrics2 = calculateExpandedMetrics(data2);

    const comparisonData = {
      dataset1: { data: data1, metrics: metrics1, label: label1 },
      dataset2: { data: data2, metrics: metrics2, label: label2 },
      type: comparisonType
    };

    // Converter métricas expandidas para básicas para compatibilidade com insights
    const basicMetrics1 = convertToBasicMetrics(metrics1);
    const basicMetrics2 = convertToBasicMetrics(metrics2);

    const insights = generateComparisonInsights(basicMetrics1, basicMetrics2, comparisonType, label1, label2);

    console.log('✅ [EXPANDED-COMPARISON] Dados processados:', {
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
