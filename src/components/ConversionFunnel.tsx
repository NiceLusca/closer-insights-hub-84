
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/types/lead";

interface ConversionFunnelProps {
  leads: Lead[];
}

export const ConversionFunnel = React.memo(({ leads }: ConversionFunnelProps) => {
  const funnelData = useMemo(() => {
    const totalLeads = leads.length;
    const contatos = leads.filter(lead => 
      lead.status && ['Contato Realizado', 'Em Negociação', 'Fechado'].includes(lead.status)
    ).length;
    const negociacao = leads.filter(lead => 
      lead.status && ['Em Negociação', 'Fechado'].includes(lead.status)
    ).length;
    const fechados = leads.filter(lead => 
      lead.status === 'Fechado'
    ).length;

    return [
      { name: 'Total de Leads', count: totalLeads, percentage: 100 },
      { name: 'Contatos Realizados', count: contatos, percentage: totalLeads > 0 ? (contatos / totalLeads) * 100 : 0 },
      { name: 'Em Negociação', count: negociacao, percentage: totalLeads > 0 ? (negociacao / totalLeads) * 100 : 0 },
      { name: 'Fechados', count: fechados, percentage: totalLeads > 0 ? (fechados / totalLeads) * 100 : 0 },
    ];
  }, [leads]);

  const getColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
    return colors[index] || 'bg-gray-500';
  };

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">{stage.name}</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{stage.count}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    ({stage.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full ${getColor(index)} transition-all duration-500 ease-out flex items-center justify-center`}
                  style={{ width: `${stage.percentage}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {stage.percentage > 15 ? `${stage.percentage.toFixed(1)}%` : ''}
                  </span>
                </div>
              </div>
              {index < funnelData.length - 1 && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Taxa de conversão: {
                    funnelData[index].count > 0 
                      ? ((funnelData[index + 1].count / funnelData[index].count) * 100).toFixed(1)
                      : '0'
                  }%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ConversionFunnel.displayName = 'ConversionFunnel';
