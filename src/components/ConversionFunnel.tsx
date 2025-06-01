
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { getLeadsByStatusGroup, STATUS_GROUPS, formatPercentage } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface ConversionFunnelProps {
  leads: Lead[];
}

export const ConversionFunnel = React.memo(({ leads }: ConversionFunnelProps) => {
  const funnelData = useMemo(() => {
    // Excluir mentorados da análise
    const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const totalLeads = validLeads.length;
    
    // Agrupar leads por status usando a nova classificação
    const statusGroups = getLeadsByStatusGroup(validLeads, true);
    
    // Calcular totais por grupo
    const fechados = statusGroups.fechado.length;
    const aSerAtendido = statusGroups.aSerAtendido.length;
    const atendidoNaoFechou = statusGroups.atendidoNaoFechou.length;
    const perdidoInativo = statusGroups.perdidoInativo.length;
    
    // Considerar "apresentações" como leads que passaram do status inicial
    const apresentacoes = fechados + atendidoNaoFechou + perdidoInativo;
    
    const stages = [
      { 
        name: 'Total de Leads', 
        count: totalLeads, 
        percentage: 100,
        description: 'Todos os leads recebidos',
        color: 'bg-blue-500'
      },
      { 
        name: STATUS_GROUPS.aSerAtendido.emoji + ' ' + STATUS_GROUPS.aSerAtendido.label, 
        count: aSerAtendido, 
        percentage: totalLeads > 0 ? (aSerAtendido / totalLeads) * 100 : 0,
        description: STATUS_GROUPS.aSerAtendido.description,
        color: 'bg-blue-500'
      },
      { 
        name: 'Apresentações Realizadas', 
        count: apresentacoes, 
        percentage: totalLeads > 0 ? (apresentacoes / totalLeads) * 100 : 0,
        description: 'Leads que passaram por atendimento',
        color: 'bg-yellow-500'
      },
      { 
        name: STATUS_GROUPS.fechado.emoji + ' ' + STATUS_GROUPS.fechado.label, 
        count: fechados, 
        percentage: totalLeads > 0 ? (fechados / totalLeads) * 100 : 0,
        description: STATUS_GROUPS.fechado.description,
        color: 'bg-green-500'
      },
    ];

    // Calcular taxas de conversão entre etapas
    const conversionRates = [
      { 
        from: 'Leads', 
        to: 'Em Processo', 
        rate: totalLeads > 0 ? (aSerAtendido / totalLeads) * 100 : 0 
      },
      { 
        from: 'Em Processo', 
        to: 'Apresentações', 
        rate: (aSerAtendido + apresentacoes) > 0 ? (apresentacoes / (aSerAtendido + apresentacoes)) * 100 : 0 
      },
      { 
        from: 'Apresentações', 
        to: 'Fechamentos', 
        rate: apresentacoes > 0 ? (fechados / apresentacoes) * 100 : 0 
      },
    ];

    return { stages, conversionRates, statusGroups };
  }, [leads]);

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
          <span className="text-sm font-normal text-gray-400">(nova classificação)</span>
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
                    ({formatPercentage(stage.percentage)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full ${stage.color} transition-all duration-500 ease-out flex items-center justify-center`}
                  style={{ width: `${stage.percentage}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {stage.percentage > 15 ? `${formatPercentage(stage.percentage)}%` : ''}
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
                            {formatPercentage(conversionRate.rate)}%
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

          {/* Resumo por Status */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <h4 className="text-sm font-medium text-gray-200 mb-3">Distribuição por Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {Object.values(funnelData.statusGroups).map((groupLeads, index) => {
                const groupKey = Object.keys(funnelData.statusGroups)[index];
                const groupInfo = STATUS_GROUPS[groupKey as keyof typeof STATUS_GROUPS];
                
                if (!groupInfo || groupLeads.length === 0) return null;
                
                return (
                  <div key={groupKey} className={`p-3 rounded-lg ${groupInfo.bgColor} border border-gray-600/50`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{groupInfo.emoji}</span>
                      <span className={`text-xs font-medium ${groupInfo.color}`}>
                        {groupInfo.label.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">{groupLeads.length}</p>
                    <p className="text-xs text-gray-300">
                      {formatPercentage((groupLeads.length / leads.filter(l => l.Status !== 'Mentorado').length) * 100)}%
                    </p>
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
