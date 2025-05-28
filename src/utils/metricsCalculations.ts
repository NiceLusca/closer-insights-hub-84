
import type { Lead, Metrics } from "@/types/lead";

export interface ExtendedMetrics extends Metrics {
  vendasCompletas: number;
  vendasRecorrentes: number;
  receitaCompleta: number;
  mentorados: number;
  aproveitamentoGeral: number; // Nova métrica
}

export function calculateMetrics(leads: Lead[]): ExtendedMetrics {
  console.log('Calculando métricas para', leads.length, 'leads');
  
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
  
  // Calcular vendas completas e recorrentes (separadas)
  const vendasCompletas = leads.filter(lead => 
    typeof lead['Venda Completa'] === 'number' && lead['Venda Completa'] > 0
  ).length;
  
  const vendasRecorrentes = leads.filter(lead => 
    typeof lead.recorrente === 'number' && lead.recorrente > 0
  ).length;
  
  // Calcular receita total - somar apenas valores válidos
  const receitaCompleta = leads.reduce((sum, lead) => {
    const venda = lead['Venda Completa'] || 0;
    return sum + (typeof venda === 'number' && !isNaN(venda) ? venda : 0);
  }, 0);
  
  const receitaRecorrente = leads.reduce((sum, lead) => {
    const recorrente = typeof lead.recorrente === 'number' ? lead.recorrente : 0;
    return sum + (!isNaN(recorrente) ? recorrente : 0);
  }, 0);
  
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  // NOVA LÓGICA: Mentorados são clientes existentes, não contam para taxas de conversão
  // Total de apresentações = apenas Fechou + Não Apareceu (excluindo Mentorados)
  const totalApresentacoes = fechamentos + noShows;
  
  // Taxa de Comparecimento: Fechamentos / Total de apresentações (excluindo Mentorados)
  const taxaComparecimento = totalApresentacoes > 0 
    ? (fechamentos / totalApresentacoes) * 100 
    : 0;
  
  // Taxa de Fechamento: igual à taxa de comparecimento (só contamos quem pode realmente comprar)
  const taxaFechamento = totalApresentacoes > 0 
    ? (fechamentos / totalApresentacoes) * 100 
    : 0;
  
  // Taxa de Desmarque: Desmarcações / Total de agendamentos
  const totalAgendamentos = agendamentos + confirmados + totalApresentacoes + mentorados;
  const taxaDesmarque = totalAgendamentos > 0 
    ? (desmarcacoes / totalAgendamentos) * 100 
    : 0;
  
  // NOVA MÉTRICA: Aproveitamento Geral
  // Todos os leads do período (excluindo mentorados) dividido pelo número de fechamentos
  const leadsExcluindoMentorados = totalLeads - mentorados;
  const aproveitamentoGeral = leadsExcluindoMentorados > 0 
    ? (fechamentos / leadsExcluindoMentorados) * 100 
    : 0;
  
  console.log('Métricas calculadas:', {
    totalLeads,
    fechamentos,
    mentorados,
    noShows,
    vendasCompletas,
    vendasRecorrentes,
    receitaCompleta,
    receitaRecorrente,
    receitaTotal,
    taxaComparecimento,
    taxaFechamento,
    aproveitamentoGeral,
    leadsExcluindoMentorados
  });
  
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
    confirmados,
    vendasCompletas,
    vendasRecorrentes,
    receitaCompleta,
    mentorados,
    aproveitamentoGeral
  };
}
