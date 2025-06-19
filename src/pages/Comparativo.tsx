
import React, { useState, useEffect } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useComparisonData } from "@/hooks/useComparisonData";
import { PeriodSelector } from "@/components/Comparison/PeriodSelector";
import { ComparisonTypeSelector } from "@/components/Comparison/ComparisonTypeSelector";
import { ComparisonFilters } from "@/components/Comparison/ComparisonFilters";
import { SideBySideMetrics } from "@/components/Comparison/SideBySideMetrics";
import { TrendComparison } from "@/components/Comparison/TrendComparison";
import { PerformanceMatrix } from "@/components/Comparison/PerformanceMatrix";
import { InsightsPanel } from "@/components/Comparison/InsightsPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const Comparativo = () => {
  const { allLeads, isLoading } = useLeadsData();
  const [comparisonType, setComparisonType] = useState<'temporal' | 'origem'>('temporal');
  const now = new Date();
  const [selectedPeriods, setSelectedPeriods] = useState({
    period1: { from: startOfMonth(now), to: endOfMonth(now) },
    period2: { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
  });
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  const { comparisonData, insights, isComparing } = useComparisonData({
    allLeads,
    comparisonType,
    selectedPeriods,
    selectedOrigins
  });

  useEffect(() => {
    document.title = 'Clarity - Análise Comparativa';
  }, []);

  if (isLoading) {
    return <LoadingState progress={50} stage="Carregando dados..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Análise Comparativa</h1>
          </div>
          <p className="text-gray-400">
            Compare períodos e origens para identificar tendências e oportunidades de melhoria
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ComparisonTypeSelector
            comparisonType={comparisonType}
            onTypeChange={setComparisonType}
          />
          
          <PeriodSelector
            selectedPeriods={selectedPeriods}
            onPeriodsChange={setSelectedPeriods}
            comparisonType={comparisonType}
          />
          
          <ComparisonFilters
            allLeads={allLeads}
            comparisonType={comparisonType}
            selectedClosers={[]}
            selectedOrigins={selectedOrigins}
            onClosersChange={() => {}}
            onOriginsChange={setSelectedOrigins}
          />
        </div>

        {/* Content */}
        {isComparing ? (
          <LoadingState progress={75} stage="Processando comparação..." />
        ) : (
          <div className="space-y-8">
            {/* Metrics Comparison */}
            <SideBySideMetrics
              comparisonData={comparisonData}
              comparisonType={comparisonType}
            />

            {/* Insights Panel */}
            <InsightsPanel insights={insights} />

            {/* Trend Comparison */}
            <TrendComparison
              comparisonData={comparisonData}
              comparisonType={comparisonType}
            />

            {/* Performance Matrix */}
            <PerformanceMatrix
              comparisonData={comparisonData}
              comparisonType={comparisonType}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparativo;
