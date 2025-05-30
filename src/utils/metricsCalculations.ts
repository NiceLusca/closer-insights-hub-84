
import type { Lead } from "@/types/lead";

export function calculateMetrics(leads: Lead[]) {
  console.log('Calculando métricas para', leads.length, 'leads');
  
  // Filtrar apenas leads válidos (excluindo mentorados)
  const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  console.log('Leads válidos (excluindo mentorados):', validLeads.length);
  
  const totalLeads = validLeads.length;
  
  // Contadores de status
  const fechou = validLeads.filter(lead => lead.Status === 'Fechou').length;
  const agendados = validLeads.filter(lead => 
    ['Agendado', 'Confirmado'].includes(lead.Status || '')
  ).length;
  const naoApareceu = validLeads.filter(lead => lead.Status === 'Não Apareceu').length;
  const desmarcou = validLeads.filter(lead => lead.Status === 'Desmarcou').length;
  const apresentacoes = fechou + naoApareceu; // Leads que tiveram apresentação
  
  // Comparecimento = Confirmados + Agendados (que efetivamente compareceram)
  const compareceram = agendados + fechou;
  const elegiveisParaComparecimento = validLeads.filter(lead => 
    ['Agendado', 'Confirmado', 'Fechou', 'Não Apareceu'].includes(lead.Status || '')
  ).length;
  
  // Cálculo de receitas
  const receitaCompleta = validLeads.reduce((sum, lead) => {
    const venda = lead['Venda Completa'];
    return sum + (typeof venda === 'number' ? venda : 0);
  }, 0);
  
  const receitaRecorrente = validLeads.reduce((sum, lead) => {
    const recorrente = lead.recorrente;
    return sum + (typeof recorrente === 'number' ? recorrente : 0);
  }, 0);
  
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  // Contadores de vendas
  const vendasCompletas = validLeads.filter(lead => 
    lead['Venda Completa'] && lead['Venda Completa'] > 0
  ).length;
  
  const vendasRecorrentes = validLeads.filter(lead => 
    lead.recorrente && lead.recorrente > 0
  ).length;
  
  // Cálculo de taxas
  const taxaFechamento = apresentacoes > 0 ? (fechou / apresentacoes) * 100 : 0;
  const taxaComparecimento = elegiveisParaComparecimento > 0 ? (compareceram / elegiveisParaComparecimento) * 100 : 0;
  const taxaDesmarque = (agendados + desmarcou) > 0 ? (desmarcou / (agendados + desmarcou)) * 100 : 0;
  
  // Aproveitamento geral = fechamentos / total de leads aproveitáveis
  const leadsAproveitaveis = validLeads.filter(lead => 
    lead.Status && !['Aguardando resposta'].includes(lead.Status)
  ).length;
  const aproveitamentoGeral = leadsAproveitaveis > 0 ? (fechou / leadsAproveitaveis) * 100 : 0;
  
  const metrics = {
    totalLeads,
    aproveitamentoGeral,
    receitaTotal,
    receitaCompleta,
    receitaRecorrente,
    taxaFechamento,
    taxaComparecimento,
    taxaDesmarque,
    vendasCompletas,
    vendasRecorrentes,
    
    // Dados adicionais para debug
    fechou,
    agendados,
    naoApareceu,
    desmarcou,
    apresentacoes,
    compareceram,
    elegiveisParaComparecimento,
    leadsAproveitaveis
  };
  
  console.log('Métricas calculadas:', metrics);
  return metrics;
}
