
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/types/lead";

// Não excluir mentorados automaticamente - deixar isso para o filtro geral
export function generateLeadsChartData(leads: Lead[]) {
  console.log('📈 Gerando dados para LeadsChart com', leads.length, 'leads');
  
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  console.log('📅 Processando últimos 30 dias...');

  const chartData = last30Days.map(date => {
    const dayLeads = leads.filter(lead => {
      if (!lead.parsedDate) {
        console.log('⚠️ Lead sem parsedDate:', lead.Nome, lead.data);
        return false;
      }
      const leadDateStr = format(lead.parsedDate, 'yyyy-MM-dd');
      const targetDateStr = format(date, 'yyyy-MM-dd');
      const matches = leadDateStr === targetDateStr;
      
      if (matches) {
        console.log(`📊 Lead ${lead.Nome} corresponde ao dia ${targetDateStr}`);
      }
      
      return matches;
    });

    const agendados = dayLeads.filter(lead => lead.Status === 'Agendado').length;
    const fechamentos = dayLeads.filter(lead => lead.Status === 'Fechou').length;

    const dayData = {
      date: format(date, 'dd/MM', { locale: ptBR }),
      total: dayLeads.length,
      agendados,
      fechamentos
    };

    if (dayLeads.length > 0) {
      console.log(`📊 ${dayData.date}: ${dayData.total} leads (${dayData.agendados} agendados, ${dayData.fechamentos} fechamentos)`);
    }

    return dayData;
  });

  console.log('✅ Dados do gráfico gerados:', chartData.filter(d => d.total > 0).length, 'dias com dados');
  console.log('📊 Amostra dos dados do gráfico:', chartData.slice(-7)); // Últimos 7 dias
  return chartData;
}

export function generateStatusDistributionData(leads: Lead[]) {
  console.log('🥧 Gerando distribuição de status com', leads.length, 'leads');
  
  const statusCount: Record<string, number> = {};
  
  leads.forEach(lead => {
    const status = lead.Status || 'Sem Status';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  console.log('📊 Contagem por status:', statusCount);

  return Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: ((count / leads.length) * 100).toFixed(1)
  }));
}

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('🎯 Gerando análise de origem com', leads.length, 'leads');
  
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  leads.forEach(lead => {
    const origem = lead.origem || 'Sem Origem';
    
    if (!originStats[origem]) {
      originStats[origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[origem].leads++;
    
    if (lead.Status === 'Fechou') {
      originStats[origem].vendas++;
      originStats[origem].receita += lead['Venda Completa'] || 0;
    }
  });

  const result = Object.entries(originStats)
    .map(([origem, stats]) => ({
      origem: origem.length > 12 ? origem.substring(0, 12) + '...' : origem,
      leads: stats.leads,
      vendas: stats.vendas,
      conversao: stats.leads > 0 ? ((stats.vendas / stats.leads) * 100).toFixed(1) : '0',
      receita: stats.receita,
      roi: stats.receita / stats.leads
    }))
    .sort((a, b) => b.receita - a.receita);

  console.log('🎯 Dados de origem processados:', result);
  return result;
}
