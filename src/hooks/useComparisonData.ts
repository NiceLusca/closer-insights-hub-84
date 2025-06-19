
import { useMemo } from 'react';
import { filterLeads } from "@/utils/dataFilters";
import { calculateMetrics } from "@/utils/metricsCalculations";
import { generateComparisonInsights } from "@/utils/comparisonUtils";
import type { Lead, DateRange } from "@/types/lead";

interface ComparisonParams {
  allLeads: Lead[];
  comparisonType: 'temporal' | 'closer' | 'origem';
  selectedPeriods: { period1: DateRange; period2: DateRange };
  selectedClosers: string[];
  selectedOrigins: string[];
}

export function useComparisonData({
  allLeads,
  comparisonType,
  selectedPeriods,
  selectedClosers,
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
        label1 = `${selectedPeriods.period1.from.toLocaleDateString()} - ${selectedPeriods.period1.to.toLocaleDateString()}`;
        label2 = `${selectedPeriods.period2.from.toLocaleDateString()} - ${selectedPeriods.period2.to.toLocaleDateString()}`;
        break;

      case 'closer':
        if (selectedClosers.length >= 2) {
          data1 = allLeads.filter(lead => lead.Closer === selectedClosers[0]);
          data2 = allLeads.filter(lead => lead.Closer === selectedClosers[1]);
          label1 = selectedClosers[0];
          label2 = selectedClosers[1];
        }
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
  }, [allLeads, comparisonType, selectedPeriods, selectedClosers, selectedOrigins]);
}
