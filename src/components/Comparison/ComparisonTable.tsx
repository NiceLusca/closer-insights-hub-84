
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/utils/metricsCalculations";
import type { Metrics } from "@/types/lead";

interface ComparisonData {
  dataset1: { data: any[]; metrics: Metrics; label: string };
  dataset2: { data: any[]; metrics: Metrics; label: string };
  type: string;
}

interface ComparisonTableProps {
  comparisonData: ComparisonData | null;
}

export const ComparisonTable = React.memo(({ comparisonData }: ComparisonTableProps) => {
  if (!comparisonData) {
    return (
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl">
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

  const isWinner = (value1: number, value2: number, higherIsBetter: boolean) => {
    if (value1 === value2) return false;
    if (higherIsBetter) {
      return value1 > value2;
    } else {
      return value1 < value2;
    }
  };

  const getWinnerCellClass = (isWinner: boolean) => {
    if (!isWinner) return '';
    return 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/30 relative overflow-hidden rounded-lg';
  };

  const WinnerIcon = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
      <Trophy className="w-4 h-4 text-yellow-400 absolute top-2 right-2 animate-pulse" />
    );
  };

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 text-center">
          Comparação Detalhada
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
      <CardContent>
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
            {metricsToCompare.map(metric => {
              const value1 = dataset1.metrics[metric.key as keyof Metrics] as number;
              const value2 = dataset2.metrics[metric.key as keyof Metrics] as number;
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
      </CardContent>
    </Card>
  );
});

ComparisonTable.displayName = 'ComparisonTable';
