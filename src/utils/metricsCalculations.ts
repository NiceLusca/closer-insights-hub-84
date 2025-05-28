
import type { Lead, Metrics } from "@/types/lead";

export function calculateMetrics(leads: Lead[]): Metrics {
  const totalLeads = leads.length;
  const agendamentos = leads.filter(lead => lead.Status === "Agendado").length;
  const noShows = leads.filter(lead => lead.Status === "Não Apareceu").length;
  const remarcacoes = leads.filter(lead => 
    lead.Status === "Remarcou" || lead.Status === "Aguardando resposta"
  ).length;
  const fechamentos = leads.filter(lead => lead.Status === "Fechou").length;
  
  const receitaTotal = leads.reduce((sum, lead) => sum + (lead['Venda Completa'] || 0), 0);
  const receitaRecorrente = leads.reduce((sum, lead) => {
    const recorrente = typeof lead.recorrente === 'number' ? lead.recorrente : 0;
    return sum + recorrente;
  }, 0);
  
  const taxaComparecimento = agendamentos + noShows > 0 
    ? (agendamentos / (agendamentos + noShows)) * 100 
    : 0;
  
  const totalApresentacoes = leads.filter(lead => 
    ["Fechou", "Não Apareceu", "Mentorado"].includes(lead.Status)
  ).length;
  
  const taxaFechamento = totalApresentacoes > 0 
    ? (fechamentos / totalApresentacoes) * 100 
    : 0;
  
  const desmarcacoes = leads.filter(lead => lead.Status === "Desmarcou").length;
  const taxaDesmarque = agendamentos > 0 
    ? (desmarcacoes / agendamentos) * 100 
    : 0;
  
  const ticketMedio = fechamentos > 0 ? receitaTotal / fechamentos : 0;
  
  return {
    totalLeads,
    agendamentos,
    noShows,
    remarcacoes,
    fechamentos,
    receitaTotal,
    receitaRecorrente,
    taxaComparecimento,
    taxaFechamento,
    taxaDesmarque,
    ticketMedio
  };
}
