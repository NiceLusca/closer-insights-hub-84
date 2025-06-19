
import React, { useState, useEffect } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useComparisonData } from "@/hooks/useComparisonData";
import { PeriodSelector } from "@/components/Comparison/PeriodSelector";
import { ComparisonTypeSelector } from "@/components/Comparison/ComparisonTypeSelector";
import { ComparisonFilters } from "@/components/Comparison/ComparisonFilters";
import { ComparisonTable } from "@/components/Comparison/ComparisonTable";
import { TrendComparison } from "@/components/Comparison/TrendComparison";
import { PerformanceMatrix } from "@/components/Comparison/PerformanceMatrix";
import { InsightsPanel } from "@/components/Comparison/InsightsPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { GitCompare, TrendingUp, Sparkles } from "lucide-react";
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
        {/* Header aprimorado */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <GitCompare className="w-10 h-10 text-blue-400" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Análise Comparativa
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                Compare períodos e origens para identificar tendências e oportunidades
              </p>
            </div>
          </div>
          
          {/* Status card */}
          {comparisonData && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">
                    Comparando: <span className="font-semibold text-blue-400">{comparisonData.dataset1.label}</span>
                    {' vs '}
                    <span className="font-semibold text-purple-400">{comparisonData.dataset2.label}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls com melhor espaçamento */}
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
            {/* Tabela Comparativa principal */}
            <ComparisonTable comparisonData={comparisonData} />

            {/* Insights Panel */}
            <InsightsPanel insights={insights} />

            {/* Análises adicionais em grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparativo;
