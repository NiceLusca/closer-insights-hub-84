import { format, subDays, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
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

export function generateOriginAnalysisData(leads: Lead[]) {
  // Incluir TODOS os leads, excluindo apenas mentorados
  const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach(lead => {
    const origem = lead.origem || 'Origem Desconhecida';
    
    if (!originStats[origem]) {
      originStats[origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[origem].leads++;
    
    if (lead.Status === 'Fechou') {
      originStats[origem].vendas++;
      originStats[origem].receita += lead['Venda Completa'] || 0;
    }
  });

  const totalLeads = filteredLeads.length;
  console.log(`📊 [ORIGIN ANALYSIS] Total de leads válidos: ${totalLeads}`);
  console.log(`📊 [ORIGIN ANALYSIS] Origens encontradas:`, Object.keys(originStats));

  // REMOVER filtro de volume - mostrar TODAS as origens
  const allOrigins = Object.entries(originStats)
    .map(([origem, stats]) => {
      return {
        origem: origem.length > 20 ? origem.substring(0, 20) + '...' : origem,
        leads: stats.leads,
        vendas: stats.vendas,
        conversao: stats.leads > 0 ? Number(((stats.vendas / stats.leads) * 100).toFixed(1)) : 0,
        receita: stats.receita,
        percentage: totalLeads > 0 ? Number(((stats.leads / totalLeads) * 100).toFixed(1)) : 0
      };
    })
    .sort((a, b) => b.leads - a.leads); // Ordenar por número de leads

  console.log(`📊 [ORIGIN ANALYSIS] Mostrando TODAS as origens: ${allOrigins.length}`);
  console.log('📊 [ORIGIN ANALYSIS] Todas as origens:', allOrigins.map(o => `${o.origem} (${o.percentage}%)`));

  return allOrigins;
}
