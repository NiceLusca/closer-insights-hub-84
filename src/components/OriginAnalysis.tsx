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
    console.log('🔍 [ORIGIN COMPONENT] === INVESTIGAÇÃO DETALHADA ===');
    console.log('🔍 [ORIGIN COMPONENT] Total de leads recebidos:', leads.length);
    
    // INVESTIGAÇÃO 1: Verificar se leads com "1k" chegam ao componente
    const leads1kNoComponente = leads.filter(lead => {
      const leadAny = lead as any;
      const origemTexto = (lead.origem || '').toLowerCase();
      const OrigemTexto = (leadAny.Origem || '').toLowerCase();
      return origemTexto.includes('1k') || origemTexto.includes('plr') || 
             OrigemTexto.includes('1k') || OrigemTexto.includes('plr');
    });
    console.log('🔍 [ORIGIN COMPONENT] Leads com "1k/PLR" que chegaram:', leads1kNoComponente.length);
    
    // INVESTIGAÇÃO 2: Verificar leads de junho especificamente
    const leadsJunho = leads.filter(lead => {
      if (lead.parsedDate) {
        const month = lead.parsedDate.getMonth(); // 0-based (maio=4, junho=5)
        return month === 5; // junho
      }
      return false;
    });
    console.log('🔍 [ORIGIN COMPONENT] Leads de junho:', leadsJunho.length);
    
    // INVESTIGAÇÃO 3: Leads de junho com "1k"
    const leads1kJunho = leadsJunho.filter(lead => {
      const leadAny = lead as any;
      const origemTexto = (lead.origem || '').toLowerCase();
      const OrigemTexto = (leadAny.Origem || '').toLowerCase();
      return origemTexto.includes('1k') || origemTexto.includes('plr') || 
             OrigemTexto.includes('1k') || OrigemTexto.includes('plr');
    });
    console.log('🔍 [ORIGIN COMPONENT] Leads "1k" de junho:', leads1kJunho.length);
    
    // INVESTIGAÇÃO 4: Status dos leads "1k"
    console.log('🔍 [ORIGIN COMPONENT] Status dos leads "1k":');
    leads1kNoComponente.forEach((lead, index) => {
      if (index < 10) { // Mostrar primeiros 10
        console.log(`  Lead ${index + 1}: ${lead.Nome} - Status: ${lead.Status} - Data: ${lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'}`);
      }
    });
    
    // INVESTIGAÇÃO 5: Campos de origem disponíveis
    const camposOrigemEncontrados = new Set();
    leads.forEach(lead => {
      const leadAny = lead as any;
      Object.keys(leadAny).forEach(key => {
        if (key.toLowerCase().includes('origem') || key.toLowerCase().includes('source') || key.toLowerCase().includes('campanha')) {
          camposOrigemEncontrados.add(key);
        }
      });
    });
    console.log('🔍 [ORIGIN COMPONENT] Campos relacionados à origem encontrados:', Array.from(camposOrigemEncontrados));
    
    const data = generateOriginAnalysisData(leads);
    console.log('🔍 [ORIGIN COMPONENT] Dados processados retornados:', data.length);
    console.log('🔍 [ORIGIN COMPONENT] Origens no resultado:', data.map(d => `${d.origem} (${d.leads} leads)`));
    
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
          Análise por Origem de Campanha
          <span className="text-sm font-normal text-gray-400">(excluindo Mentorados)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {originData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma origem encontrada nos dados.</p>
            <p className="text-gray-500 text-sm mt-2">Debug: {leads.length} leads recebidos</p>
          </div>
        ) : (
          <>
            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-700/50 rounded text-xs text-gray-300">
              <p>Debug: {originData.length} origens processadas de {leads.length} leads</p>
              <p>Top 3 origens: {originData.slice(0, 3).map(o => `${o.origem} (${o.leads})`).join(', ')}</p>
            </div>
            
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
            
            {/* Informações adicionais - mostrar todas as origens */}
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
