
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { getLeadsExcludingMentorados } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface LossAnalysisProps {
  leads: Lead[];
}

export const LossAnalysis = React.memo(({ leads }: LossAnalysisProps) => {
  const detailedAnalysis = useMemo(() => {
    console.log('🔍 [LOSS ANALYSIS] Calculando análise detalhada de perdas');
    
    const validLeads = getLeadsExcludingMentorados(leads);
    const metrics = calculateStandardizedMetrics(validLeads);
    
    // 1. Análise por Etapa do Funil
    const funnelLosses = [
      {
        etapa: "Não Compareceram",
        quantidade: validLeads.filter(l => ['Não Apareceu', 'Desmarcou'].includes(l.Status || '')).length,
        percentualDoTotal: 0,
        cor: "#f59e0b" // amber
      },
      {
        etapa: "Compareceram mas Não Fecharam",
        quantidade: metrics.atendidoNaoFechou,
        percentualDoTotal: 0,
        cor: "#ef4444" // red
      },
      {
        etapa: "Perdidos/Inativos",
        quantidade: metrics.perdidoInativo,
        percentualDoTotal: 0,
        cor: "#6b7280" // gray
      }
    ];

    // Calcular percentuais
    funnelLosses.forEach(item => {
      item.percentualDoTotal = metrics.totalLeads > 0 ? (item.quantidade / metrics.totalLeads) * 100 : 0;
    });

    // 2. Análise por Tipo de Comportamento
    const behaviorAnalysis = [
      {
        tipo: "Não Apareceu",
        quantidade: validLeads.filter(l => l.Status === 'Não Apareceu').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#f59e0b"
      },
      {
        tipo: "Desmarcou",
        quantidade: validLeads.filter(l => l.Status === 'Desmarcou').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#f97316"
      },
      {
        tipo: "Não Fechou após Atendimento",
        quantidade: validLeads.filter(l => l.Status === 'Não Fechou').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#ef4444"
      },
      {
        tipo: "Aguardando Resposta",
        quantidade: validLeads.filter(l => l.Status === 'Aguardando resposta').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#eab308"
      }
    ];

    // Calcular percentuais e impacto financeiro estimado
    const ticketMedioEstimado = metrics.ticketMedio || 2500; // fallback
    behaviorAnalysis.forEach(item => {
      item.percentual = metrics.totalLeads > 0 ? (item.quantidade / metrics.totalLeads) * 100 : 0;
      item.impactoFinanceiro = item.quantidade * ticketMedioEstimado;
    });

    // 3. Análise de Eficiência por Closer
    const closerLossAnalysis: any[] = [];
    const closersStats: Record<string, any> = {};
    
    validLeads.forEach(lead => {
      const closer = lead.Closer || 'Sem Closer';
      if (!closersStats[closer]) {
        closersStats[closer] = {
          total: 0,
          apresentacoes: 0,
          fechamentos: 0,
          perdas: 0
        };
      }
      
      closersStats[closer].total++;
      
      if (['Fechou', 'Não Fechou', 'Aguardando resposta'].includes(lead.Status || '')) {
        closersStats[closer].apresentacoes++;
        if (lead.Status === 'Fechou') {
          closersStats[closer].fechamentos++;
        } else {
          closersStats[closer].perdas++;
        }
      }
    });

    Object.entries(closersStats).forEach(([closer, stats]) => {
      if (stats.apresentacoes > 0) {
        closerLossAnalysis.push({
          closer: closer.length > 12 ? closer.substring(0, 12) + '...' : closer,
          perdas: stats.perdas,
          apresentacoes: stats.apresentacoes,
          taxaPerda: (stats.perdas / stats.apresentacoes) * 100,
          eficiencia: (stats.fechamentos / stats.apresentacoes) * 100
        });
      }
    });

    return {
      funnelLosses: funnelLosses.filter(item => item.quantidade > 0),
      behaviorAnalysis: behaviorAnalysis.filter(item => item.quantidade > 0),
      closerLossAnalysis: closerLossAnalysis.sort((a, b) => b.taxaPerda - a.taxaPerda).slice(0, 6),
      totalPerdaFinanceira: behaviorAnalysis.reduce((acc, item) => acc + item.impactoFinanceiro, 0),
      metrics
    };
  }, [leads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-medium mb-1">{data.tipo || data.etapa || data.closer}</p>
          <p className="text-blue-400 text-sm">Quantidade: {data.quantidade || data.perdas}</p>
          <p className="text-yellow-400 text-sm">
            Percentual: {(data.percentual || data.taxaPerda || data.percentualDoTotal || 0).toFixed(1)}%
          </p>
          {data.impactoFinanceiro && (
            <p className="text-red-400 text-sm">
              Impacto: R$ {data.impactoFinanceiro.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Análise Detalhada de Perdas
        </CardTitle>
        <p className="text-sm text-gray-400">
          Análise comportamental e financeira das perdas no processo comercial
        </p>
      </CardHeader>
      <CardContent>
        {/* 1. Resumo Executivo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 rounded-lg border border-red-500/30">
            <div className="text-center">
              <p className="text-red-300 text-xs font-semibold uppercase tracking-wide">Total de Perdas</p>
              <p className="text-2xl font-bold text-red-200">
                {detailedAnalysis.funnelLosses.reduce((acc, item) => acc + item.quantidade, 0)}
              </p>
              <p className="text-red-400 text-sm">
                {detailedAnalysis.metrics.totalLeads > 0 
                  ? ((detailedAnalysis.funnelLosses.reduce((acc, item) => acc + item.quantidade, 0) / detailedAnalysis.metrics.totalLeads) * 100).toFixed(1)
                  : 0}% do total
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-4 rounded-lg border border-amber-500/30">
            <div className="text-center">
              <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide">Não Compareceram</p>
              <p className="text-2xl font-bold text-amber-200">
                {detailedAnalysis.funnelLosses.find(item => item.etapa === "Não Compareceram")?.quantidade || 0}
              </p>
              <p className="text-amber-400 text-sm">
                {(detailedAnalysis.funnelLosses.find(item => item.etapa === "Não Compareceram")?.percentualDoTotal || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-4 rounded-lg border border-orange-500/30">
            <div className="text-center">
              <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide">Perdas Pós-Atendimento</p>
              <p className="text-2xl font-bold text-orange-200">
                {detailedAnalysis.funnelLosses.find(item => item.etapa === "Compareceram mas Não Fecharam")?.quantidade || 0}
              </p>
              <p className="text-orange-400 text-sm">
                {(detailedAnalysis.funnelLosses.find(item => item.etapa === "Compareceram mas Não Fecharam")?.percentualDoTotal || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
            <div className="text-center">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Impacto Financeiro</p>
              <p className="text-2xl font-bold text-purple-200">
                R$ {(detailedAnalysis.totalPerdaFinanceira / 1000).toFixed(0)}k
              </p>
              <p className="text-purple-400 text-sm">Potencial perdido</p>
            </div>
          </div>
        </div>

        {/* 2. Análise por Tipo de Comportamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Distribuição por Tipo de Perda
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={detailedAnalysis.behaviorAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="quantidade"
                >
                  {detailedAnalysis.behaviorAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#d1d5db' }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload?.percentual?.toFixed(1) || '0'}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-xl">💰</span>
              Impacto Financeiro por Tipo
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={detailedAnalysis.behaviorAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="tipo" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="impactoFinanceiro" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Análise de Performance dos Closers - Foco em Perdas */}
        {detailedAnalysis.closerLossAnalysis.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-xl">👥</span>
              Taxa de Perda por Closer
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={detailedAnalysis.closerLossAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="closer" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="taxaPerda" 
                  fill="#f59e0b"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 4. Insights e Recomendações */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
          <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Insights e Oportunidades
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-amber-400">Oportunidade de Recuperação:</span>
              </p>
              <p className="text-gray-400">
                {detailedAnalysis.behaviorAnalysis.find(item => item.tipo === "Aguardando Resposta")?.quantidade || 0} leads 
                ainda podem ser recuperados com follow-up ativo.
              </p>
            </div>
            <div>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-red-400">Maior Fonte de Perda:</span>
              </p>
              <p className="text-gray-400">
                {detailedAnalysis.behaviorAnalysis.length > 0 
                  ? detailedAnalysis.behaviorAnalysis.sort((a, b) => b.quantidade - a.quantidade)[0].tipo
                  : 'N/A'} representa a maior fonte de perdas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LossAnalysis.displayName = 'LossAnalysis';
