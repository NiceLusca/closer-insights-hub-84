
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { WinnerBadge } from "./WinnerBadge";
import { formatCurrency } from "@/utils/metricsCalculations";
import type { Metrics } from "@/types/lead";

interface ComparisonData {
  dataset1: { data: any[]; metrics: Metrics; label: string };
  dataset2: { data: any[]; metrics: Metrics; label: string };
  type: string;
}

interface SideBySideMetricsProps {
  comparisonData: ComparisonData | null;
  comparisonType: string;
}

export const SideBySideMetrics = React.memo(({ comparisonData }: SideBySideMetricsProps) => {
  if (!comparisonData) {
    return (
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Selecione os parâmetros para ver a comparação</p>
        </CardContent>
      </Card>
    );
  }

  const { dataset1, dataset2 } = comparisonData;

  const metricsToCompare = [
    { 
      key: 'totalLeads', 
      label: 'Total de Leads', 
      format: (value: number) => value.toString(),
      higherIsBetter: true
    },
    { 
      key: 'fechamentos', 
      label: 'Fechamentos', 
      format: (value: number) => value.toString(),
      higherIsBetter: true
    },
    { 
      key: 'receitaTotal', 
      label: 'Receita Total', 
      format: formatCurrency,
      higherIsBetter: true
    },
    { 
      key: 'taxaFechamento', 
      label: 'Taxa de Fechamento', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true
    },
    { 
      key: 'taxaComparecimento', 
      label: 'Taxa de Comparecimento', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true
    },
    { 
      key: 'aproveitamentoGeral', 
      label: 'Aproveitamento Geral', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true
    },
    { 
      key: 'ticketMedio', 
      label: 'Ticket Médio', 
      format: formatCurrency,
      higherIsBetter: true
    },
    { 
      key: 'taxaDesmarque', 
      label: 'Taxa de Desmarque', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: false
    },
    { 
      key: 'noShows', 
      label: 'No Shows', 
      format: (value: number) => value.toString(),
      higherIsBetter: false
    },
    { 
      key: 'remarcacoes', 
      label: 'Remarcações', 
      format: (value: number) => value.toString(),
      higherIsBetter: false
    },
    { 
      key: 'receitaRecorrente', 
      label: 'Receita Recorrente', 
      format: formatCurrency,
      higherIsBetter: true
    },
    { 
      key: 'receitaCompleta', 
      label: 'Receita Completa', 
      format: formatCurrency,
      higherIsBetter: true
    }
  ];

  const calculateDifference = (value1: number, value2: number) => {
    if (value2 === 0) return value1 > 0 ? 100 : 0;
    return ((value1 - value2) / value2) * 100;
  };

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-400';
    if (diff < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const isWinner = (value1: number, value2: number, higherIsBetter: boolean) => {
    if (higherIsBetter) {
      return value1 > value2;
    } else {
      return value1 < value2;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dataset 1 */}
        <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-400">
              {dataset1.label}
            </CardTitle>
            <p className="text-sm text-gray-400">{dataset1.data.length} leads</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricsToCompare.map(metric => {
                const value1 = dataset1.metrics[metric.key as keyof Metrics] as number;
                const value2 = dataset2.metrics[metric.key as keyof Metrics] as number;
                const winner1 = isWinner(value1, value2, metric.higherIsBetter);
                
                return (
                  <div key={metric.key} className="flex justify-between items-center">
                    <span className="text-gray-300">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {metric.format(value1)}
                      </span>
                      <WinnerBadge isWinner={winner1} type="performance" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dataset 2 */}
        <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-400">
              {dataset2.label}
            </CardTitle>
            <p className="text-sm text-gray-400">{dataset2.data.length} leads</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricsToCompare.map(metric => {
                const value1 = dataset1.metrics[metric.key as keyof Metrics] as number;
                const value2 = dataset2.metrics[metric.key as keyof Metrics] as number;
                const winner2 = isWinner(value2, value1, metric.higherIsBetter);
                
                return (
                  <div key={metric.key} className="flex justify-between items-center">
                    <span className="text-gray-300">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {metric.format(value2)}
                      </span>
                      <WinnerBadge isWinner={winner2} type="performance" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Summary */}
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Comparação Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricsToCompare.map(metric => {
              const value1 = dataset1.metrics[metric.key as keyof Metrics] as number;
              const value2 = dataset2.metrics[metric.key as keyof Metrics] as number;
              const difference = calculateDifference(value1, value2);
              const winner1 = isWinner(value1, value2, metric.higherIsBetter);
              
              return (
                <div key={metric.key} className="bg-gray-700/50 p-4 rounded-lg relative">
                  <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <div className="text-blue-400">{dataset1.label}: {metric.format(value1)}</div>
                      <div className="text-purple-400">{dataset2.label}: {metric.format(value2)}</div>
                    </div>
                    <div className={`flex items-center gap-1 ${getDifferenceColor(difference)}`}>
                      {getDifferenceIcon(difference)}
                      <span className="text-sm font-medium">
                        {Math.abs(difference).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {(winner1 || isWinner(value2, value1, metric.higherIsBetter)) && (
                    <div className="absolute top-2 right-2">
                      <WinnerBadge 
                        isWinner={true} 
                        type="target"
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SideBySideMetrics.displayName = 'SideBySideMetrics';
