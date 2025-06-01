
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { Lead } from "@/types/lead";

interface ConversionFunnelProps {
  leads: Lead[];
}

export const ConversionFunnel = React.memo(({ leads }: ConversionFunnelProps) => {
  const funnelData = useMemo(() => {
    // Excluir mentorados da análise
    const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const totalLeads = validLeads.length;
    
    // Etapas do funil baseadas nos status reais
    const agendados = validLeads.filter(lead => 
      lead.Status && ['Agendado', 'Confirmado'].includes(lead.Status)
    ).length;
    
    const apresentacoes = validLeads.filter(lead => 
      lead.Status && ['Fechou', 'Não Apareceu', 'Não Fechou'].includes(lead.Status)
    ).length;
    
    const fechados = validLeads.filter(lead => 
      lead.Status === 'Fechou'
    ).length;

    const stages = [
      { 
        name: 'Total de Leads', 
        count: totalLeads, 
        percentage: 100,
        description: 'Todos os leads recebidos'
      },
      { 
        name: 'Agendamentos', 
        count: agendados, 
        percentage: totalLeads > 0 ? (agendados / totalLeads) * 100 : 0,
        description: 'Leads que agendaram apresentação'
      },
      { 
        name: 'Apresentações', 
        count: apresentacoes, 
        percentage: totalLeads > 0 ? (apresentacoes / totalLeads) * 100 : 0,
        description: 'Leads que tiveram apresentação'
      },
      { 
        name: 'Fechamentos', 
        count: fechados, 
        percentage: totalLeads > 0 ? (fechados / totalLeads) * 100 : 0,
        description: 'Leads que fecharam venda'
      },
    ];

    // Calcular taxas de conversão entre etapas
    const conversionRates = [
      { from: 'Leads', to: 'Agendamentos', rate: totalLeads > 0 ? (agendados / totalLeads) * 100 : 0 },
      { from: 'Agendamentos', to: 'Apresentações', rate: agendados > 0 ? (apresentacoes / agendados) * 100 : 0 },
      { from: 'Apresentações', to: 'Fechamentos', rate: apresentacoes > 0 ? (fechados / apresentacoes) * 100 : 0 },
    ];

    return { stages, conversionRates };
  }, [leads]);

  const getColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
    return colors[index] || 'bg-gray-500';
  };

  const getConversionStatus = (rate: number, threshold: number = 25) => {
    if (rate >= threshold) return { icon: TrendingUp, color: 'text-green-400' };
    if (rate >= threshold * 0.7) return { icon: TrendingDown, color: 'text-yellow-400' };
    return { icon: AlertTriangle, color: 'text-red-400' };
  };

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          Funil de Conversão
          <span className="text-sm font-normal text-gray-400">(excluindo mentorados)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Etapas do Funil */}
          {funnelData.stages.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-200">{stage.name}</span>
                  <p className="text-xs text-gray-400">{stage.description}</p>
                </div>
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
              
              {/* Taxa de conversão para próxima etapa */}
              {index < funnelData.conversionRates.length && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  {(() => {
                    const conversionRate = funnelData.conversionRates[index];
                    const status = getConversionStatus(conversionRate.rate);
                    const Icon = status.icon;
                    
                    return (
                      <>
                        <Icon className={`w-4 h-4 ${status.color}`} />
                        <span className="text-gray-300">
                          {conversionRate.from} → {conversionRate.to}: 
                          <span className={`ml-1 font-medium ${status.color}`}>
                            {conversionRate.rate.toFixed(1)}%
                          </span>
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}
              
              {index < funnelData.stages.length - 1 && (
                <div className="mt-4 border-b border-gray-600/30"></div>
              )}
            </div>
          ))}

          {/* Resumo de Performance */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <h4 className="text-sm font-medium text-gray-200 mb-3">Resumo de Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {funnelData.conversionRates.map((rate, index) => {
                const status = getConversionStatus(rate.rate);
                const Icon = status.icon;
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${status.color}`} />
                    <span className="text-gray-300">
                      {rate.from.slice(0, 6)}→{rate.to.slice(0, 6)}: 
                      <span className={`ml-1 font-medium ${status.color}`}>
                        {rate.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ConversionFunnel.displayName = 'ConversionFunnel';
