
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { STATUS_GROUPS, formatPercentage } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface StatusDistributionCardsProps {
  leads: Lead[];
}

export function StatusDistributionCards({ leads }: StatusDistributionCardsProps) {
  const statusData = useMemo(() => {
    console.log('📊 [STATUS CARDS] Processando', leads.length, 'leads');
    
    const metrics = calculateStandardizedMetrics(leads);
    
    const statusGroups = {
      fechado: metrics.fechados,
      aSerAtendido: metrics.aSerAtendido,
      atendidoNaoFechou: metrics.atendidoNaoFechou,
      perdidoInativo: metrics.perdidoInativo
    };

    console.log('📊 [STATUS CARDS] Grupos:', statusGroups);
    
    return { statusGroups, metrics };
  }, [leads]);

  const totalLeads = statusData.metrics.totalLeads;

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Distribuição por Status (excluindo Mentorados)
        </CardTitle>
        <p className="text-sm text-gray-400">
          Total de {totalLeads} leads válidos analisados
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusData.statusGroups).map(([groupKey, groupLeads]) => {
            const groupInfo = STATUS_GROUPS[groupKey as keyof typeof STATUS_GROUPS];
            
            if (!groupInfo) return null;
            
            const percentage = totalLeads > 0 ? (groupLeads / totalLeads) * 100 : 0;
            
            return (
              <div key={groupKey} className={`p-4 rounded-lg ${groupInfo.bgColor} border border-gray-600/50 hover:shadow-lg transition-all duration-200`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{groupInfo.emoji}</span>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${groupInfo.color} block`}>
                      {groupInfo.label.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{groupLeads}</p>
                  <p className={`text-sm font-medium ${groupInfo.color}`}>
                    {formatPercentage(percentage)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    do total de leads
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Resumo rápido */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-400">Taxa de Comparecimento</p>
              <p className="text-white font-bold">
                {formatPercentage(statusData.metrics.taxaComparecimento)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Taxa de Fechamento</p>
              <p className="text-white font-bold">
                {formatPercentage(statusData.metrics.taxaFechamento)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Aproveitamento Geral</p>
              <p className="text-white font-bold">
                {formatPercentage(statusData.metrics.aproveitamentoGeral)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Apresentações</p>
              <p className="text-white font-bold">
                {statusData.metrics.apresentacoes}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
