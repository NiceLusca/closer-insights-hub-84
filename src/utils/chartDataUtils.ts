import { format, subDays, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseNumber } from "@/utils/field/valueParser";
import type { Lead } from "@/types/lead";

export function generateLeadsChartData(leads: Lead[]) {
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  return last30Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Incluir leads com data válida OU usar fallback de created_at/timestamp
    const dayLeads = leads.filter(lead => {
      // Primeiro, tentar usar parsedDate
      if (lead.parsedDate && isValid(lead.parsedDate)) {
        return format(lead.parsedDate, 'yyyy-MM-dd') === dateStr;
      }
      
      // Fallback: usar data original se possível
      if (lead.data) {
        try {
          const leadDate = new Date(lead.data);
          if (isValid(leadDate)) {
            return format(leadDate, 'yyyy-MM-dd') === dateStr;
          }
        } catch (e) {
          // Continuar para próximo fallback
        }
      }
      
      // Último fallback: usar row_number para distribuir uniformemente
      // Isso garante que leads apareçam nos gráficos mesmo sem data válida
      if (!lead.parsedDate && lead.row_number) {
        const dayIndex = (lead.row_number - 1) % 30;
        const leadDay = subDays(new Date(), 29 - dayIndex);
        return format(leadDay, 'yyyy-MM-dd') === dateStr;
      }
      
      return false;
    });

    const agendados = dayLeads.filter(lead => 
      ['Agendado', 'Confirmado'].includes(lead.Status || '')
    ).length;
    
    const fechamentos = dayLeads.filter(lead => 
      lead.Status === 'Fechou'
    ).length;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      total: dayLeads.length,
      agendados,
      fechamentos
    };
  });
}

export function generateStatusDistributionData(leads: Lead[]) {
  // Incluir TODOS os leads, excluindo apenas mentorados
  const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  
  const statusCount: Record<string, number> = {};
  
  filteredLeads.forEach(lead => {
    const status = lead.Status || 'Sem Status';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const total = filteredLeads.length;
  
  return Object.entries(statusCount)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.value - a.value);
}

// Função otimizada para extrair origem
function extractOriginFromLead(lead: Lead): string {
  const leadAny = lead as any;
  
  // Lista de campos possíveis para origem (mais focada)
  const possibleOriginFields = [
    'origem', 'Origem', 'origem_campanha', 'source', 'utm_source', 
    'utm_campaign', 'campanha', 'Campanha', 'canal', 'Canal'
  ];
  
  // Tentar cada campo possível
  for (const field of possibleOriginFields) {
    if (leadAny[field] && typeof leadAny[field] === 'string' && leadAny[field].trim()) {
      return leadAny[field].trim();
    }
  }
  
  // Busca por padrões conhecidos em qualquer campo string
  const knownPatterns = ['1k', 'plr', 'dia', 'facebook', 'instagram', 'google', 'youtube'];
  for (const [key, value] of Object.entries(leadAny)) {
    if (value && typeof value === 'string' && value.trim()) {
      const valueLower = value.toLowerCase();
      if (knownPatterns.some(pattern => valueLower.includes(pattern))) {
        return value.trim();
      }
    }
  }
  
  return 'Origem Desconhecida';
}

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('📊 [ORIGIN DATA] === GERAÇÃO DE DADOS DE ORIGEM ===');
  console.log('📊 [ORIGIN DATA] Total de leads recebidos:', leads.length);
  
  // Filtrar apenas leads válidos (não mentorados)
  const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  console.log('📊 [ORIGIN DATA] Leads válidos (sem mentorados):', validLeads.length);
  
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  validLeads.forEach((lead) => {
    const origem = extractOriginFromLead(lead);
    
    if (!originStats[origem]) {
      originStats[origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[origem].leads++;
    
    // Cálculo MELHORADO de vendas e receita
    const statusValue = lead.Status?.trim() || '';
    const vendaCompleta = parseNumber(lead['Venda Completa']) || 0;
    const recorrente = parseNumber(lead.recorrente) || 0;
    const receitaTotal = vendaCompleta + recorrente;
    
    // Considerar como venda se: Status "Fechou" OU tem receita registrada
    const temVenda = statusValue === 'Fechou' || receitaTotal > 0;
    
    if (temVenda) {
      originStats[origem].vendas++;
      originStats[origem].receita += receitaTotal;
      
      // Log específico para origem "1K por Dia"
      if (origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr') || origem.toLowerCase().includes('dia')) {
        console.log(`💰 [ORIGIN DATA] VENDA "1K": ${lead.Nome} - R$ ${receitaTotal.toFixed(2)} (VC: ${vendaCompleta}, Rec: ${recorrente})`);
      }
    }
  });

  const totalLeads = validLeads.length;
  
  // Log específico da origem "1K por Dia"
  const origem1kKey = Object.keys(originStats).find(key => 
    key.toLowerCase().includes('1k') || key.toLowerCase().includes('plr') || key.toLowerCase().includes('dia')
  );
  
  if (origem1kKey) {
    const stats1k = originStats[origem1kKey];
    console.log(`💰 [ORIGIN DATA] ESTATÍSTICAS "1K por Dia":`, {
      origem: origem1kKey,
      leads: stats1k.leads,
      vendas: stats1k.vendas,
      receita: stats1k.receita.toFixed(2)
    });
  }

  const result = Object.entries(originStats)
    .map(([origem, stats]) => ({
      origem: origem.length > 25 ? origem.substring(0, 25) + '...' : origem,
      leads: stats.leads,
      vendas: stats.vendas,
      conversao: stats.leads > 0 ? Number(((stats.vendas / stats.leads) * 100).toFixed(1)) : 0,
      receita: stats.receita,
      percentage: totalLeads > 0 ? Number(((stats.leads / totalLeads) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.leads - a.leads);

  console.log(`📊 [ORIGIN DATA] Resultado final: ${result.length} origens processadas`);
  console.log('📊 [ORIGIN DATA] === FIM GERAÇÃO ===');
  
  return result;
}
