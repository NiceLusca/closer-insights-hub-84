
import type { Lead, Metrics } from "@/types/lead";

export function calculateMetrics(leads: Lead[]): Metrics {
  const totalLeads = leads.length;
  
  // Separar leads por status
  const agendamentos = leads.filter(lead => lead.Status === "Agendado").length;
  const confirmados = leads.filter(lead => lead.Status === "Confirmado").length;
  const noShows = leads.filter(lead => lead.Status === "Não Apareceu").length;
  const fechamentos = leads.filter(lead => lead.Status === "Fechou").length;
  const mentorados = leads.filter(lead => lead.Status === "Mentorado").length;
  const desmarcacoes = leads.filter(lead => lead.Status === "Desmarcou").length;
  const remarcacoes = leads.filter(lead => 
    lead.Status === "Remarcou" || lead.Status === "Aguardando resposta"
  ).length;
  
  // Calcular receita total - somar apenas valores válidos
  const receitaTotal = leads.reduce((sum, lead) => {
    const venda = lead['Venda Completa'] || 0;
    return sum + (typeof venda === 'number' && !isNaN(venda) ? venda : 0);
  }, 0);
  
  const receitaRecorrente = leads.reduce((sum, lead) => {
    const recorrente = typeof lead.recorrente === 'number' ? lead.recorrente : 0;
    return sum + (!isNaN(recorrente) ? recorrente : 0);
  }, 0);
  
  // Taxa de Comparecimento: Quem compareceu (Fechou + Mentorado) vs Total de apresentações
  const totalApresentacoes = fechamentos + mentorados + noShows;
  const compareceram = fechamentos + mentorados;
  const taxaComparecimento = totalApresentacoes > 0 
    ? (compareceram / totalApresentacoes) * 100 
    : 0;
  
  // Taxa de Fechamento: Fechamentos / Total de apresentações
  const taxaFechamento = totalApresentacoes > 0 
    ? (fechamentos / totalApresentacoes) * 100 
    : 0;
  
  // Taxa de Desmarque: Desmarcações / Total de agendamentos (incluindo confirmados)
  const totalAgendamentos = agendamentos + confirmados + totalApresentacoes;
  const taxaDesmarque = totalAgendamentos > 0 
    ? (desmarcacoes / totalAgendamentos) * 100 
    : 0;
  
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
    confirmados
  };
}
