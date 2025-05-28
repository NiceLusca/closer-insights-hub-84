
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/types/lead";

// Excluir mentorados dos dados dos gráficos
export function filterLeadsForCharts(leads: Lead[]): Lead[] {
  return leads.filter(lead => lead.Status !== "Mentorado");
}

export function generateLeadsChartData(leads: Lead[]) {
  const filteredLeads = filterLeadsForCharts(leads);
  
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  return last30Days.map(date => {
    const dayLeads = filteredLeads.filter(lead => {
      if (!lead.parsedDate) return false;
      return format(lead.parsedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });

    const agendados = dayLeads.filter(lead => lead.Status === 'Agendado').length;
    const fechamentos = dayLeads.filter(lead => lead.Status === 'Fechou').length;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      total: dayLeads.length,
      agendados,
      fechamentos
    };
  });
}

export function generateStatusDistributionData(leads: Lead[]) {
  const filteredLeads = filterLeadsForCharts(leads);
  const statusCount: Record<string, number> = {};
  
  filteredLeads.forEach(lead => {
    statusCount[lead.Status] = (statusCount[lead.Status] || 0) + 1;
  });

  return Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: ((count / filteredLeads.length) * 100).toFixed(1)
  }));
}

export function generateOriginAnalysisData(leads: Lead[]) {
  const filteredLeads = filterLeadsForCharts(leads);
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach(lead => {
    if (!originStats[lead.origem]) {
      originStats[lead.origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[lead.origem].leads++;
    
    if (lead.Status === 'Fechou') {
      originStats[lead.origem].vendas++;
      originStats[lead.origem].receita += lead['Venda Completa'] || 0;
    }
  });

  return Object.entries(originStats)
    .map(([origem, stats]) => ({
      origem: origem.length > 12 ? origem.substring(0, 12) + '...' : origem,
      leads: stats.leads,
      vendas: stats.vendas,
      conversao: stats.leads > 0 ? ((stats.vendas / stats.leads) * 100).toFixed(1) : '0',
      receita: stats.receita,
      roi: stats.receita / stats.leads
    }))
    .sort((a, b) => b.receita - a.receita);
}
