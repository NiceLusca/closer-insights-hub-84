
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Filter, TrendingUp } from "lucide-react";
import { generateOriginAnalysisData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface OriginAnalysisProps {
  leads: Lead[];
}

export const OriginAnalysis = React.memo(({ leads }: OriginAnalysisProps) => {
  const { originData, totalOrigins, filteredOrigins } = useMemo(() => {
    const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const allOrigins = new Set(filteredLeads.map(lead => lead.origem || 'Origem Desconhecida')).size;
    const significantOrigins = generateOriginAnalysisData(leads);
    
    return {
      originData: significantOrigins,
      totalOrigins: allOrigins,
      filteredOrigins: significantOrigins.length
    };
  }, [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originData = payload[0]?.payload;
      if (originData) {
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
            <p className="text-gray-200 font-medium mb-2">{`Origem: ${label}`}</p>
            <div className="space-y-1 text-xs">
              <p className="text-blue-400">Total de Leads: {originData.leads} ({originData.percentage}% do total)</p>
              <p className="text-green-400">Vendas: {originData.vendas}</p>
              <p className="text-purple-400">Taxa de Conversão: {originData.conversao}%</p>
              <p className="text-yellow-400">Receita: {formatCurrency(originData.receita)}</p>
            </div>
          </div>
        );
      }
    }
    return null;
  });

  CustomTooltip.displayName = 'CustomTooltip';

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Análise por Origem de Campanha
          <span className="text-sm font-normal text-gray-400">(excluindo Mentorados)</span>
        </CardTitle>
        
        {/* Indicador de filtro de volume */}
        {totalOrigins > filteredOrigins && (
          <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <Filter className="w-4 h-4" />
            <span>
              Exibindo {filteredOrigins} de {totalOrigins} origens (filtro: mínimo 5% do volume total)
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {originData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma origem atende ao critério de volume mínimo (5% do total de leads).</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={originData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="origem" 
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="leads" 
                  fill="#60a5fa" 
                  name="Total de Leads"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="vendas" 
                  fill="#34d399" 
                  name="Vendas"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Informações adicionais - mostrar todas as origens significativas */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {originData.slice(0, 6).map((item, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
                  <h4 className="font-medium text-sm text-gray-200 truncate" title={item.origem}>
                    {item.origem}
                  </h4>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>Leads: {item.leads} ({item.percentage}%)</div>
                    <div>Taxa: {item.conversao}%</div>
                    <div>Receita: {formatCurrency(item.receita)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

OriginAnalysis.displayName = 'OriginAnalysis';
