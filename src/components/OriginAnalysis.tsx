
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { generateOriginAnalysisData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface OriginAnalysisProps {
  leads: Lead[];
}

export const OriginAnalysis = React.memo(({ leads }: OriginAnalysisProps) => {
  const originData = useMemo(() => {
    console.log('🔍 [ORIGIN ANALYSIS] === ANÁLISE DE ORIGEM DOS LEADS ===');
    console.log('🔍 [ORIGIN ANALYSIS] Total de leads recebidos:', leads.length);
    
    // Debug específico para leads de interesse (apenas os mais importantes)
    const leads1k = leads.filter(lead => {
      const leadAny = lead as any;
      const todasOrigensTexto = [
        lead.origem || '',
        leadAny.Origem || '',
        leadAny.origem_campanha || '',
        leadAny.source || ''
      ].join(' ').toLowerCase();
      
      return todasOrigensTexto.includes('1k') || 
             todasOrigensTexto.includes('plr') ||
             todasOrigensTexto.includes('dia');
    });
    
    console.log('🔍 [ORIGIN ANALYSIS] Leads "1K por Dia" encontrados:', leads1k.length);
    
    // Log detalhado apenas para leads 1K com vendas
    const leads1kComVendas = leads1k.filter(lead => {
      const vendaCompleta = Number(lead['Venda Completa']) || 0;
      const recorrente = Number(lead.recorrente) || 0;
      return vendaCompleta > 0 || recorrente > 0 || lead.Status === 'Fechou';
    });
    
    console.log('🔍 [ORIGIN ANALYSIS] Leads "1K por Dia" com vendas:', leads1kComVendas.length);
    leads1kComVendas.forEach(lead => {
      console.log(`💰 [ORIGIN ANALYSIS] - ${lead.Nome}: Status="${lead.Status}", VendaCompleta=${lead['Venda Completa']}, Recorrente=${lead.recorrente}`);
    });
    
    const data = generateOriginAnalysisData(leads);
    
    // Log específico da origem "1K por Dia"
    const origem1k = data.find(item => 
      item.origem.toLowerCase().includes('1k') || 
      item.origem.toLowerCase().includes('plr') ||
      item.origem.toLowerCase().includes('dia')
    );
    
    if (origem1k) {
      console.log('💰 [ORIGIN ANALYSIS] Faturamento "1K por Dia":', {
        origem: origem1k.origem,
        leads: origem1k.leads,
        vendas: origem1k.vendas,
        receita: origem1k.receita,
        conversao: origem1k.conversao
      });
    } else {
      console.log('⚠️ [ORIGIN ANALYSIS] Origem "1K por Dia" não encontrada no resultado final');
    }
    
    console.log('🔍 [ORIGIN ANALYSIS] === FIM ANÁLISE ===');
    return data;
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
          Origem dos Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {originData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma origem encontrada nos dados filtrados.</p>
            <p className="text-gray-500 text-sm mt-2">Total de leads: {leads.length}</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={originData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="origem" 
                  stroke="#9ca3af"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
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
            
            {/* Grid de cards das origens */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {originData.map((item, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
                  <h4 className="font-medium text-sm text-gray-200 truncate" title={item.origem}>
                    {item.origem}
                  </h4>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>Leads: {item.leads} ({item.percentage}%)</div>
                    <div>Vendas: {item.vendas}</div>
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
