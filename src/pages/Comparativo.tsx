
import React, { useState, useEffect } from 'react';
import { useFastLeadsData } from "@/hooks/useFastLeadsData";
import { useExpandedComparisonData } from "@/hooks/useExpandedComparisonData";
import { PageHeader } from "@/components/PageHeader";
import { PeriodSelector } from "@/components/Comparison/PeriodSelector";
import { ComparisonTypeSelector, type ComparisonType } from "@/components/Comparison/ComparisonTypeSelector";
import { ComparisonFilters } from "@/components/Comparison/ComparisonFilters";
import { ExpandedComparisonTable } from "@/components/Comparison/ExpandedComparisonTable";
import { TrendComparison } from "@/components/Comparison/TrendComparison";
import { PerformanceMatrix } from "@/components/Comparison/PerformanceMatrix";
import { InsightsPanel } from "@/components/Comparison/InsightsPanel";
import { FastLoadingIndicator } from "@/components/Dashboard/FastLoadingIndicator";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const Comparativo = () => {
  // MIGRAÇÃO COMPLETA: Usar exclusivamente useFastLeadsData
  const { 
    allLeads, 
    isLoading, 
    lastUpdated, 
    dataReady, 
    cacheStatus, 
    forceRefresh 
  } = useFastLeadsData();
  
  const [comparisonType, setComparisonType] = useState<ComparisonType>('period');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const now = new Date();
  const [selectedPeriods, setSelectedPeriods] = useState({
    period1: { from: startOfMonth(now), to: endOfMonth(now) },
    period2: { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
  });
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  const mappedComparisonType = comparisonType === 'period' ? 'temporal' : 'origem';

  // Usar hook corrigido de comparação
  const { comparisonData, insights, isComparing } = useExpandedComparisonData({
    allLeads,
    comparisonType: mappedComparisonType,
    selectedPeriods,
    selectedOrigins
  });

  console.log('📊 [COMPARATIVO] === MIGRAÇÃO COMPLETA FASE 2 ===');
  console.log('📊 [COMPARATIVO] - Total leads:', allLeads.length);
  console.log('📊 [COMPARATIVO] - Comparison data:', comparisonData ? 'Disponível' : 'Indisponível');

  useEffect(() => {
    document.title = 'Clarity - Análise Comparativa';
  }, []);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingState progress={50} stage="Sistema unificado Supabase..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <PageHeader 
            title="Análise Comparativa"
            description="Compare períodos e origens (Sistema Unificado Supabase)"
          />
          
          <div className="flex items-center gap-4">
            <FastLoadingIndicator 
              cacheStatus={cacheStatus}
              lastUpdated={lastUpdated}
              isUpdatingInBackground={isRefreshing}
            />
            
            <Button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        
        {comparisonData && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">
                  Comparando: <span className="font-semibold text-blue-400">{comparisonData.dataset1.label}</span>
                  {' vs '}
                  <span className="font-semibold text-purple-400">{comparisonData.dataset2.label}</span>
                </span>
                <span className="text-xs text-gray-500">
                  ({comparisonData.dataset1.data.length} vs {comparisonData.dataset2.data.length} leads)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ComparisonTypeSelector
            selectedType={comparisonType}
            onTypeChange={setComparisonType}
          />
          
          <PeriodSelector
            selectedPeriods={selectedPeriods}
            onPeriodsChange={setSelectedPeriods}
            comparisonType={mappedComparisonType}
          />
          
          <ComparisonFilters
            allLeads={allLeads}
            comparisonType={mappedComparisonType}
            selectedClosers={[]}
            selectedOrigins={selectedOrigins}
            onClosersChange={() => {}}
            onOriginsChange={setSelectedOrigins}
          />
        </div>

        {isComparing ? (
          <LoadingState progress={75} stage="Processando comparação..." />
        ) : (
          <div className="space-y-8">
            <ExpandedComparisonTable comparisonData={comparisonData} />
            <InsightsPanel insights={insights} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <TrendComparison
                comparisonData={comparisonData}
                comparisonType={mappedComparisonType}
              />
              <PerformanceMatrix
                comparisonData={comparisonData}
                comparisonType={mappedComparisonType}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparativo;
