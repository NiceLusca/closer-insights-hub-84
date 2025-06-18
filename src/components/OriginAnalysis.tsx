
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
    console.log('🔍 [ORIGIN ANALYSIS] === INVESTIGAÇÃO DETALHADA INÍCIO ===');
    console.log('🔍 [ORIGIN ANALYSIS] Total de leads recebidos no componente:', leads.length);
    
    // INVESTIGAÇÃO 1: Verificar estrutura dos primeiros leads
    console.log('🔍 [ORIGIN ANALYSIS] Estrutura dos primeiros 3 leads:');
    leads.slice(0, 3).forEach((lead, index) => {
      const leadAny = lead as any;
      console.log(`  Lead ${index + 1}:`, {
        Nome: lead.Nome,
        Status: lead.Status,
        origem: lead.origem,
        Origem: leadAny.Origem,
        camposDisponiveis: Object.keys(leadAny).filter(key => 
          key.toLowerCase().includes('origem') || 
          key.toLowerCase().includes('source') || 
          key.toLowerCase().includes('campanha')
        ),
        data: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'
      });
    });
    
    // INVESTIGAÇÃO 2: Buscar todos os leads com "1k" ou "plr" (case insensitive)
    const leads1kTotal = leads.filter(lead => {
      const leadAny = lead as any;
      const todasOrigensTexto = [
        lead.origem || '',
        leadAny.Origem || '',
        leadAny.origem_campanha || '',
        leadAny.source || '',
        leadAny.utm_source || '',
        leadAny.campaign_source || ''
      ].join(' ').toLowerCase();
      
      return todasOrigensTexto.includes('1k') || 
             todasOrigensTexto.includes('plr') ||
             todasOrigensTexto.includes('dia');
    });
    
    console.log('🔍 [ORIGIN ANALYSIS] Leads com "1k/PLR/dia" encontrados:', leads1kTotal.length);
    console.log('🔍 [ORIGIN ANALYSIS] Detalhes desses leads:');
    leads1kTotal.forEach((lead, index) => {
      const leadAny = lead as any;
      console.log(`  ${index + 1}. Nome: ${lead.Nome}`);
      console.log(`     Status: ${lead.Status}`);
      console.log(`     origem: "${lead.origem}"`);
      console.log(`     Origem: "${leadAny.Origem}"`);
      console.log(`     Data: ${lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'}`);
      console.log(`     Mês: ${lead.parsedDate ? lead.parsedDate.getMonth() + 1 : 'N/A'}`);
    });
    
    // INVESTIGAÇÃO 3: Verificar distribuição por status ANTES do filtro
    const statusDistribution = {};
    leads.forEach(lead => {
      const status = lead.Status || 'Sem Status';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });
    console.log('🔍 [ORIGIN ANALYSIS] Distribuição por status (ANTES do filtro):', statusDistribution);
    
    // INVESTIGAÇÃO 4: Verificar quantos são mentorados
    const mentorados = leads.filter(lead => lead.Status === 'Mentorado');
    console.log('🔍 [ORIGIN ANALYSIS] Leads mentorados que serão filtrados:', mentorados.length);
    
    // INVESTIGAÇÃO 5: Verificar leads de junho especificamente
    const leadsJunho = leads.filter(lead => {
      if (lead.parsedDate) {
        const month = lead.parsedDate.getMonth(); // 0-based (junho = 5)
        return month === 5;
      }
      return false;
    });
    console.log('🔍 [ORIGIN ANALYSIS] Leads de junho encontrados:', leadsJunho.length);
    
    // INVESTIGAÇÃO 6: Leads de junho com "1k"
    const leads1kJunho = leadsJunho.filter(lead => {
      const leadAny = lead as any;
      const todasOrigensTexto = [
        lead.origem || '',
        leadAny.Origem || '',
        leadAny.origem_campanha || '',
        leadAny.source || '',
        leadAny.utm_source || '',
        leadAny.campaign_source || ''
      ].join(' ').toLowerCase();
      
      return todasOrigensTexto.includes('1k') || 
             todasOrigensTexto.includes('plr') ||
             todasOrigensTexto.includes('dia');
    });
    console.log('🔍 [ORIGIN ANALYSIS] Leads "1k/PLR/dia" de junho:', leads1kJunho.length);
    
    // Processar dados usando a função corrigida
    const data = generateOriginAnalysisData(leads);
    console.log('🔍 [ORIGIN ANALYSIS] Dados processados retornados:', data.length);
    console.log('🔍 [ORIGIN ANALYSIS] Top 10 origens no resultado:');
    data.slice(0, 10).forEach((origem, index) => {
      console.log(`  ${index + 1}. ${origem.origem}: ${origem.leads} leads (${origem.percentage}%)`);
    });
    
    console.log('🔍 [ORIGIN ANALYSIS] === INVESTIGAÇÃO DETALHADA FIM ===');
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
          <span className="text-sm font-normal text-gray-400">(todos os leads válidos)</span>
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
              <p>Top 5 origens: {originData.slice(0, 5).map(o => `${o.origem} (${o.leads})`).join(', ')}</p>
            </div>
            
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
            
            {/* Mostrar TODAS as origens em cards */}
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
