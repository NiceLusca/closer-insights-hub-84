
import { useMemo } from 'react';
import { filterLeads } from "@/utils/dataFilters";
import { calculateExpandedMetrics } from "@/utils/expandedMetricsCalculations";
import { generateComparisonInsights } from "@/utils/comparisonUtils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead, DateRange, Metrics } from "@/types/lead";

interface ExpandedComparisonParams {
  allLeads: Lead[];
  comparisonType: 'temporal' | 'origem';
  selectedPeriods: { period1: DateRange; period2: DateRange };
  selectedOrigins: string[];
}

// CORREÇÃO CRÍTICA: Função melhorada para nomes de períodos
const getPeriodName = (dateRange: DateRange): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Detectar mês atual
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  
  // Detectar mês anterior
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));
  
  // Comparar datas com tolerância
  const isSameDate = (date1: Date, date2: Date) => 
    Math.abs(date1.getTime() - date2.getTime()) < 24 * 60 * 60 * 1000; // 1 dia de tolerância
  
  if (isSameDate(dateRange.from, startOfCurrentMonth) && 
      isSameDate(dateRange.to, endOfCurrentMonth)) {
    return "Este Mês";
  }
  
  if (isSameDate(dateRange.from, startOfLastMonth) && 
      isSameDate(dateRange.to, endOfLastMonth)) {
    return "Mês Passado";
  }
  
  // Verificar se é um mês completo
  const isFullMonth = dateRange.from.getDate() === 1 && 
                     dateRange.to.getDate() === endOfMonth(dateRange.to).getDate();
  
  if (isFullMonth) {
    return format(dateRange.from, "MMMM 'de' yyyy", { locale: ptBR });
  }
  
  return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
};

// CORREÇÃO: Converter métricas expandidas para básicas
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
    agendamentos: expandedMetrics.agendamentos || 0,
    confirmados: expandedMetrics.confirmados || 0,
    mentorados: expandedMetrics.mentorados || 0,
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
    console.log('🔄 [EXPANDED-COMPARISON] === CORREÇÃO FASE 4 ===');
    console.log('🔄 [EXPANDED-COMPARISON] Total leads disponíveis:', allLeads.length);
    console.log('🔄 [EXPANDED-COMPARISON] Tipo de comparação:', comparisonType);
    
    if (!allLeads || allLeads.length === 0) {
      return {
        comparisonData: null,
        insights: [],
        isComparing: false
      };
    }

    let data1: Lead[] = [];
    let data2: Lead[] = [];
    let label1 = '';
    let label2 = '';

    switch (comparisonType) {
      case 'temporal':
        // CORREÇÃO CRÍTICA: Filtros temporais corretos
        data1 = filterLeads(
          allLeads, 
          selectedPeriods.period1, 
          { status: [], closer: [], origem: [] },
          { isTemporalFilter: true, component: 'comparison-period1' }
        );
        
        data2 = filterLeads(
          allLeads, 
          selectedPeriods.period2, 
          { status: [], closer: [], origem: [] },
          { isTemporalFilter: true, component: 'comparison-period2' }
        );
        
        label1 = getPeriodName(selectedPeriods.period1);
        label2 = getPeriodName(selectedPeriods.period2);
        
        console.log('📅 [COMPARISON] Período 1:', label1, '- Leads:', data1.length);
        console.log('📅 [COMPARISON] Período 2:', label2, '- Leads:', data2.length);
        break;

      case 'origem':
        if (selectedOrigins.length >= 2) {
          data1 = allLeads.filter(lead => lead.origem === selectedOrigins[0]);
          data2 = allLeads.filter(lead => lead.origem === selectedOrigins[1]);
          label1 = selectedOrigins[0];
          label2 = selectedOrigins[1];
          
          console.log('🎯 [COMPARISON] Origem 1:', label1, '- Leads:', data1.length);
          console.log('🎯 [COMPARISON] Origem 2:', label2, '- Leads:', data2.length);
        }
        break;
    }

    // Calcular métricas para cada conjunto
    const metrics1 = calculateExpandedMetrics(data1);
    const metrics2 = calculateExpandedMetrics(data2);

    const comparisonData = {
      dataset1: { data: data1, metrics: metrics1, label: label1 },
      dataset2: { data: data2, metrics: metrics2, label: label2 },
      type: comparisonType
    };

    // Converter para métricas básicas para insights
    const basicMetrics1 = convertToBasicMetrics(metrics1);
    const basicMetrics2 = convertToBasicMetrics(metrics2);

    const insights = generateComparisonInsights(basicMetrics1, basicMetrics2, comparisonType, label1, label2);

    console.log('✅ [EXPANDED-COMPARISON] Comparação processada:');
    console.log('📊 Dataset 1 - Total:', data1.length, 'Receita:', metrics1.receitaTotal);
    console.log('📊 Dataset 2 - Total:', data2.length, 'Receita:', metrics2.receitaTotal);
    console.log('💡 Insights gerados:', insights.length);

    return {
      comparisonData,
      insights,
      isComparing: false
    };
  }, [allLeads, comparisonType, selectedPeriods, selectedOrigins]);
}
