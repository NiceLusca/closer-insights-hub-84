
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3 } from "lucide-react";

interface PerformanceMatrixProps {
  comparisonData: any;
  comparisonType: string;
}

export const PerformanceMatrix = React.memo(({ comparisonData }: PerformanceMatrixProps) => {
  if (!comparisonData) {
    return null;
  }

  const { dataset1, dataset2 } = comparisonData;

  const matrixData = [
    {
      metric: 'Volume de Leads',
      dataset1Value: dataset1.metrics.totalLeads,
      dataset2Value: dataset2.metrics.totalLeads,
      category: 'Volume'
    },
    {
      metric: 'Taxa de Conversão',
      dataset1Value: `${dataset1.metrics.taxaFechamento.toFixed(1)}%`,
      dataset2Value: `${dataset2.metrics.taxaFechamento.toFixed(1)}%`,
      category: 'Eficiência'
    },
    {
      metric: 'Receita Total',
      dataset1Value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataset1.metrics.receitaTotal),
      dataset2Value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataset2.metrics.receitaTotal),
      category: 'Financeiro'
    },
    {
      metric: 'Ticket Médio',
      dataset1Value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataset1.metrics.ticketMedio),
      dataset2Value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataset2.metrics.ticketMedio),
      category: 'Financeiro'
    }
  ];

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5" />
          Matriz de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-2 text-gray-300">Métrica</th>
                <th className="text-center py-3 px-2 text-blue-400">{dataset1.label}</th>
                <th className="text-center py-3 px-2 text-purple-400">{dataset2.label}</th>
                <th className="text-center py-3 px-2 text-gray-300">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 px-2 text-gray-300">{row.metric}</td>
                  <td className="py-3 px-2 text-center font-medium text-white">{row.dataset1Value}</td>
                  <td className="py-3 px-2 text-center font-medium text-white">{row.dataset2Value}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="bg-gray-600/50 px-2 py-1 rounded text-xs text-gray-300">
                      {row.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceMatrix.displayName = 'PerformanceMatrix';
