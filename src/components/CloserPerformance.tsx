
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Percent, Hash } from "lucide-react";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { getLeadsExcludingMentorados } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface CloserPerformanceProps {
  leads: Lead[];
}

export function CloserPerformance({ leads }: CloserPerformanceProps) {
  const [viewMode, setViewMode] = useState<'percentage' | 'absolute'>('percentage');
  
  console.log('🎯 [CLOSER PERFORMANCE] Processando', leads.length, 'leads usando métricas padronizadas');

  const closerData = useMemo(() => {
    // Usar leads válidos (excluindo mentorados)
    const validLeads = getLeadsExcludingMentorados(leads);
    console.log('🎯 [CLOSER PERFORMANCE] Leads válidos:', validLeads.length);
    
    const closerStats: Record<string, Lead[]> = {};
    
    // Agrupar leads por closer
    validLeads.forEach(lead => {
      const closer = lead.Closer || 'Sem Closer';
      if (!closerStats[closer]) {
        closerStats[closer] = [];
      }
      closerStats[closer].push(lead);
    });

    const result = Object.entries(closerStats).map(([closer, closerLeads]) => {
      // Usar métricas padronizadas para cada closer
      const metrics = calculateStandardizedMetrics(closerLeads);
      
      return {
        closer: closer.split(' ')[0], // Mostrar apenas primeiro nome
        leads: metrics.totalLeads,
        vendas: metrics.fechados,
        conversao: metrics.aproveitamentoGeral, // Usar aproveitamento geral padronizado
        receita: metrics.receitaTotal
      };
    }).sort((a, b) => viewMode === 'percentage' ? b.conversao - a.conversao : b.vendas - a.vendas);

    console.log('🎯 [CLOSER PERFORMANCE] Dados processados com métricas padronizadas:', result);
    return result;
  }, [leads, viewMode]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalLeads = closerData.reduce((sum, item) => sum + item.leads, 0);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-100">
              Performance por Closer
            </CardTitle>
            <p className="text-sm text-gray-400">
              {totalLeads} leads analisados (usando métricas padronizadas, excluindo mentorados)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('percentage')}
              className="flex items-center space-x-1"
            >
              <Percent className="w-4 h-4" />
              <span>%</span>
            </Button>
            <Button
              variant={viewMode === 'absolute' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('absolute')}
              className="flex items-center space-x-1"
            >
              <Hash className="w-4 h-4" />
              <span>Nº</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={closerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="closer" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#f3f4f6',
                zIndex: 10000
              }}
              formatter={(value, name) => {
                if (name === 'Total de Leads') return [value, 'Total de Leads'];
                if (name === 'Aproveitamento Geral (%)') return [`${(value as number).toFixed(1)}%`, 'Aproveitamento Geral'];
                if (name === 'Número de Vendas') return [value, 'Número de Vendas'];
                return [value, name];
              }}
            />
            <Legend />
            {viewMode === 'percentage' ? (
              <Bar 
                dataKey="conversao" 
                fill="#10b981" 
                name="Aproveitamento Geral (%)"
                radius={[2, 2, 0, 0]}
              />
            ) : (
              <>
                <Bar 
                  dataKey="leads" 
                  fill="#3b82f6" 
                  name="Total de Leads"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="vendas" 
                  fill="#10b981" 
                  name="Número de Vendas"
                  radius={[2, 2, 0, 0]}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
