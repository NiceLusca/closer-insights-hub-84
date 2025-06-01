
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Users, UserX, Target } from "lucide-react";
import { getLeadsByStatusGroup, STATUS_GROUPS, formatPercentage } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface ConversionFunnelProps {
  leads: Lead[];
}

export const ConversionFunnel = React.memo(({ leads }: ConversionFunnelProps) => {
  const funnelData = useMemo(() => {
    const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const totalLeads = validLeads.length;
    
    const statusGroups = getLeadsByStatusGroup(validLeads, true);
    
    const fechados = statusGroups.fechado.length;
    const aSerAtendido = statusGroups.aSerAtendido.length;
    const atendidoNaoFechou = statusGroups.atendidoNaoFechou.length;
    const perdidoInativo = statusGroups.perdidoInativo.length;
    
    const apresentacoes = fechados + atendidoNaoFechou + perdidoInativo;
    
    const stages = [
      { 
        name: 'Total de Leads', 
        count: totalLeads, 
        percentage: 100,
        description: 'Todos os leads recebidos',
        color: 'bg-blue-500',
        type: 'neutral' as const
      },
      { 
        name: STATUS_GROUPS.aSerAtendido.emoji + ' ' + STATUS_GROUPS.aSerAtendido.label, 
        count: aSerAtendido, 
        percentage: totalLeads > 0 ? (aSerAtendido / totalLeads) * 100 : 0,
        description: 'Leads ainda no processo de vendas',
        color: 'bg-blue-500',
        type: 'process' as const
      },
      { 
        name: 'Apresentações Realizadas', 
        count: apresentacoes, 
        percentage: totalLeads > 0 ? (apresentacoes / totalLeads) * 100 : 0,
        description: 'Leads que passaram por atendimento',
        color: 'bg-yellow-500',
        type: 'neutral' as const
      },
      { 
        name: STATUS_GROUPS.fechado.emoji + ' ' + STATUS_GROUPS.fechado.label, 
        count: fechados, 
        percentage: totalLeads > 0 ? (fechados / totalLeads) * 100 : 0,
        description: 'Leads que efetivamente compraram',
        color: 'bg-green-500',
        type: 'success' as const
      },
    ];

    // Calcular taxas de conversão
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

    // Calcular estatísticas de perda com mais detalhes
    const lossStats = {
      perdidoInativo,
      atendidoNaoFechou,
      totalPerdidos: perdidoInativo + atendidoNaoFechou,
      taxaPerdaGeral: totalLeads > 0 ? ((perdidoInativo + atendidoNaoFechou) / totalLeads) * 100 : 0,
      taxaPerdaApresentacao: apresentacoes > 0 ? (perdidoInativo / apresentacoes) * 100 : 0,
      taxaIneficiencia: apresentacoes > 0 ? (atendidoNaoFechou / apresentacoes) * 100 : 0
    };

    return { stages, conversionRates, statusGroups, lossStats };
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
          <Target className="w-5 h-5" />
          Funil de Conversão
          <span className="text-sm font-normal text-gray-400">(análise detalhada de perdas)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Destaque de Leads Perdidos */}
          {funnelData.lossStats.taxaPerdaGeral > 25 && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <UserX className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium text-lg">⚠️ ALERTA: Alto Índice de Perda</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{funnelData.lossStats.totalPerdidos}</p>
                  <p className="text-sm text-gray-300">Leads Perdidos</p>
                  <p className="text-xs text-red-300">{formatPercentage(funnelData.lossStats.taxaPerdaGeral)}% do total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{funnelData.lossStats.perdidoInativo}</p>
                  <p className="text-sm text-gray-300">Não Compareceram</p>
                  <p className="text-xs text-yellow-300">{formatPercentage(funnelData.lossStats.taxaPerdaApresentacao)}% das apresentações</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{funnelData.lossStats.atendidoNaoFechou}</p>
                  <p className="text-sm text-gray-300">Atendidos sem Conversão</p>
                  <p className="text-xs text-orange-300">{formatPercentage(funnelData.lossStats.taxaIneficiencia)}% das apresentações</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-300">
                  🎯 <strong>Ação Recomendada:</strong> Revisar processo de confirmação e técnicas de fechamento
                </p>
              </div>
            </div>
          )}

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

          {/* Análise Detalhada de Perdas */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <div className="flex items-center gap-2 mb-3">
              <UserX className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-medium text-gray-200">📊 Breakdown Detalhado de Perdas</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">❌</span>
                  <span className="text-xs font-medium text-red-400">PERDIDOS/INATIVOS</span>
                </div>
                <p className="text-lg font-bold text-white">{funnelData.lossStats.perdidoInativo}</p>
                <p className="text-xs text-red-300">
                  {formatPercentage((funnelData.lossStats.perdidoInativo / leads.filter(l => l.Status !== 'Mentorado').length) * 100)}% do total
                </p>
                <p className="text-xs text-gray-400 mt-1">Não apareceram, desmarcaram ou não atenderam</p>
                <div className="mt-2 text-xs">
                  <p className="text-red-200">💡 <strong>Causa:</strong> Falta de confirmação/acompanhamento</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🕐</span>
                  <span className="text-xs font-medium text-yellow-400">NÃO FECHARAM</span>
                </div>
                <p className="text-lg font-bold text-white">{funnelData.lossStats.atendidoNaoFechou}</p>
                <p className="text-xs text-yellow-300">
                  {formatPercentage((funnelData.lossStats.atendidoNaoFechou / leads.filter(l => l.Status !== 'Mentorado').length) * 100)}% do total
                </p>
                <p className="text-xs text-gray-400 mt-1">Atendidos mas sem conversão</p>
                <div className="mt-2 text-xs">
                  <p className="text-yellow-200">💡 <strong>Causa:</strong> Técnica de vendas ou timing</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">✅</span>
                  <span className="text-xs font-medium text-green-400">CONVERSÕES</span>
                </div>
                <p className="text-lg font-bold text-white">{funnelData.statusGroups.fechado.length}</p>
                <p className="text-xs text-green-300">
                  {formatPercentage((funnelData.statusGroups.fechado.length / leads.filter(l => l.Status !== 'Mentorado').length) * 100)}% do total
                </p>
                <p className="text-xs text-gray-400 mt-1">Vendas efetivadas com sucesso</p>
                <div className="mt-2 text-xs">
                  <p className="text-green-200">🎯 <strong>Meta:</strong> Aumentar este percentual</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-600/50 rounded-lg">
              <h5 className="text-xs font-medium text-gray-200 mb-2">📈 Métricas de Performance</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Taxa de Comparecimento:</p>
                  <p className="text-white font-bold">
                    {formatPercentage(100 - funnelData.lossStats.taxaPerdaApresentacao)}%
                    <span className={`ml-1 ${funnelData.lossStats.taxaPerdaApresentacao > 30 ? 'text-red-400' : 'text-green-400'}`}>
                      {funnelData.lossStats.taxaPerdaApresentacao > 30 ? '⚠️' : '✅'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Eficiência de Fechamento:</p>
                  <p className="text-white font-bold">
                    {formatPercentage(100 - funnelData.lossStats.taxaIneficiencia)}%
                    <span className={`ml-1 ${funnelData.lossStats.taxaIneficiencia > 40 ? 'text-red-400' : 'text-green-400'}`}>
                      {funnelData.lossStats.taxaIneficiencia > 40 ? '⚠️' : '✅'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo por Status */}
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <h4 className="text-sm font-medium text-gray-200 mb-3">Distribuição Atual por Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {Object.entries(funnelData.statusGroups).map(([groupKey, groupLeads]) => {
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
