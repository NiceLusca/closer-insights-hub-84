
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/metricsCalculations";
import type { ExpandedMetrics } from "@/utils/expandedMetricsCalculations";

interface ExpandedComparisonData {
  dataset1: { data: any[]; metrics: ExpandedMetrics; label: string };
  dataset2: { data: any[]; metrics: ExpandedMetrics; label: string };
  type: string;
}

interface ExpandedComparisonTableProps {
  comparisonData: ExpandedComparisonData | null;
}

export const ExpandedComparisonTable = React.memo(({ comparisonData }: ExpandedComparisonTableProps) => {
  if (!comparisonData) {
    return (
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Selecione os parâmetros para ver a comparação expandida</p>
        </CardContent>
      </Card>
    );
  }

  const { dataset1, dataset2 } = comparisonData;

  const expandedMetricsToCompare = [
    // Métricas básicas
    { 
      key: 'totalLeads', 
      label: 'Total de Leads', 
      format: (value: number) => value.toString(),
      higherIsBetter: true,
      category: 'basic'
    },
    { 
      key: 'fechamentos', 
      label: 'Fechamentos', 
      format: (value: number) => value.toString(),
      higherIsBetter: true,
      category: 'basic'
    },
    { 
      key: 'receitaTotal', 
      label: 'Receita Total', 
      format: formatCurrency,
      higherIsBetter: true,
      category: 'basic'
    },
    { 
      key: 'taxaFechamento', 
      label: 'Taxa de Fechamento', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true,
      category: 'basic'
    },

    // Novas métricas de recorrência
    { 
      key: 'vendasRecorrentes', 
      label: 'Vendas Recorrentes', 
      format: (value: number) => value.toString(),
      higherIsBetter: true,
      category: 'recurrence'
    },
    { 
      key: 'vendasCompletas', 
      label: 'Vendas Completas', 
      format: (value: number) => value.toString(),
      higherIsBetter: true,
      category: 'recurrence'
    },
    { 
      key: 'percentualRecorrencia', 
      label: '% Recorrência', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true,
      category: 'recurrence'
    },
    { 
      key: 'ticketMedioRecorrente', 
      label: 'Ticket Médio Recorrente', 
      format: formatCurrency,
      higherIsBetter: true,
      category: 'recurrence'
    },
    { 
      key: 'ticketMedioCompleto', 
      label: 'Ticket Médio Completo', 
      format: formatCurrency,
      higherIsBetter: true,
      category: 'recurrence'
    },

    // Métricas de performance
    { 
      key: 'roiPorOrigem', 
      label: 'ROI por Lead', 
      format: formatCurrency,
      higherIsBetter: true,
      category: 'performance'
    },
    { 
      key: 'leadsPorDia', 
      label: 'Leads por Dia', 
      format: (value: number) => value.toFixed(1),
      higherIsBetter: true,
      category: 'performance'
    },
    { 
      key: 'conversaoRapida', 
      label: 'Conversões Rápidas', 
      format: (value: number) => value.toString(),
      higherIsBetter: true,
      category: 'performance'
    },
    { 
      key: 'conversaoLenta', 
      label: 'Conversões Lentas', 
      format: (value: number) => value.toString(),
      higherIsBetter: false,
      category: 'performance'
    },

    // Métricas de qualidade
    { 
      key: 'taxaComparecimento', 
      label: 'Taxa de Comparecimento', 
      format: (value: number) => `${value.toFixed(1)}%`,
      higherIsBetter: true,
      category: 'quality'
    },
    { 
      key: 'noShows', 
      label: 'No Shows', 
      format: (value: number) => value.toString(),
      higherIsBetter: false,
      category: 'quality'
    }
  ];

  const isWinner = (value1: number, value2: number, higherIsBetter: boolean) => {
    if (value1 === value2) return false;
    return higherIsBetter ? value1 > value2 : value1 < value2;
  };

  const getWinnerCellClass = (isWinner: boolean) => {
    if (!isWinner) return '';
    return 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/30 relative overflow-hidden rounded-xl';
  };

  const WinnerIcon = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
      <Trophy className="w-4 h-4 text-yellow-400 absolute top-2 right-2 animate-pulse" />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recurrence':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'performance':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'quality':
        return <TrendingDown className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'basic': return 'Métricas Básicas';
      case 'recurrence': return 'Análise de Recorrência';
      case 'performance': return 'Performance & ROI';
      case 'quality': return 'Qualidade dos Leads';
      default: return 'Outras';
    }
  };

  // Agrupar métricas por categoria
  const groupedMetrics = expandedMetricsToCompare.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof expandedMetricsToCompare>);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 text-center">
          Análise Comparativa Expandida
        </CardTitle>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-400">{dataset1.label}</h3>
            <p className="text-sm text-gray-400">{dataset1.data.length} leads</p>
          </div>
          <div className="text-2xl text-gray-500">VS</div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-purple-400">{dataset2.label}</h3>
            <p className="text-sm text-gray-400">{dataset2.data.length} leads</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedMetrics).map(([category, metrics]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              {getCategoryIcon(category)}
              <h4 className="text-lg font-semibold text-gray-200">
                {getCategoryName(category)}
              </h4>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700/50">
                  <TableHead className="text-blue-400 font-semibold text-center w-1/3">
                    {dataset1.label}
                  </TableHead>
                  <TableHead className="text-gray-300 font-semibold text-center w-1/3">
                    Métrica
                  </TableHead>
                  <TableHead className="text-purple-400 font-semibold text-center w-1/3">
                    {dataset2.label}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map(metric => {
                  const value1 = dataset1.metrics[metric.key as keyof ExpandedMetrics] as number;
                  const value2 = dataset2.metrics[metric.key as keyof ExpandedMetrics] as number;
                  const winner1 = isWinner(value1, value2, metric.higherIsBetter);
                  const winner2 = isWinner(value2, value1, metric.higherIsBetter);
                  
                  return (
                    <TableRow key={metric.key} className="border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-200">
                      <TableCell className={`text-center py-4 relative ${getWinnerCellClass(winner1)}`}>
                        <span className={`font-medium ${winner1 ? 'text-cyan-300' : 'text-white'}`}>
                          {metric.format(value1)}
                        </span>
                        <WinnerIcon show={winner1} />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="text-gray-300 font-medium">{metric.label}</span>
                      </TableCell>
                      <TableCell className={`text-center py-4 relative ${getWinnerCellClass(winner2)}`}>
                        <span className={`font-medium ${winner2 ? 'text-purple-300' : 'text-white'}`}>
                          {metric.format(value2)}
                        </span>
                        <WinnerIcon show={winner2} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

ExpandedComparisonTable.displayName = 'ExpandedComparisonTable';
