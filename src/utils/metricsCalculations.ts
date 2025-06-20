import type { Lead, Metrics } from "@/types/lead";

// Função auxiliar para retornar métricas padrão
function getDefaultMetrics(): Metrics {
  return {
    totalLeads: 0,
    agendamentos: 0,
    confirmados: 0,
    apresentacoes: 0,
    compareceram: 0,
    noShows: 0,
    remarcacoes: 0,
    fechamentos: 0,
    fechados: 0,
    vendasCompletas: 0,
    vendasRecorrentes: 0,
    receitaTotal: 0,
    receitaCompleta: 0,
    receitaRecorrente: 0,
    taxaFechamento: 0,
    taxaComparecimento: 0,
    aproveitamentoGeral: 0,
    ticketMedio: 0,
    taxaDesmarque: 0,
    taxaNaoFechamento: 0,
    aSerAtendido: 0,
    atendidoNaoFechou: 0,
    perdidoInativo: 0
  };
}

export function calculateMetrics(leads: Lead[]): Metrics {
  console.log('📊 [METRICS] === CORREÇÃO CRÍTICA DOS CÁLCULOS ===');
  console.log('📊 [METRICS] Total leads recebidos:', leads.length);
  
  if (!leads || leads.length === 0) {
    console.warn('⚠️ [METRICS] Nenhum lead para calcular métricas');
    return getDefaultMetrics();
  }

  // CORREÇÃO CRÍTICA: Função para conversão segura de valores monetários
  const parseMonetaryValue = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.max(0, value); // Garantir que não seja negativo
    }
    
    if (typeof value === 'string') {
      // Remover símbolos monetários e converter
      const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    
    return 0;
  };

  // Separar leads por categoria com logs detalhados
  const agendamentos = leads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const isAgendado = ['agendado', 'agendamento'].some(s => status.includes(s));
    return isAgendado;
  });

  const confirmados = leads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const isConfirmado = ['confirmado', 'confirmação'].some(s => status.includes(s));
    return isConfirmado;
  });

  const noShows = leads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const isNoShow = ['no show', 'noshow', 'não compareceu', 'faltou'].some(s => status.includes(s));
    return isNoShow;
  });

  const compareceram = leads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const isCompareceu = ['compareceu', 'apresentou', 'atendido'].some(s => status.includes(s));
    return isCompareceu;
  });

  // CORREÇÃO CRÍTICA: Calcular vendas com validação rigorosa
  const vendasCompletas = leads.filter(lead => {
    const vendaCompleta = parseMonetaryValue(lead['Venda Completa']);
    const isVendaCompleta = vendaCompleta > 0;
    
    if (isVendaCompleta) {
      console.log(`💰 [METRICS] Venda Completa encontrada: ${lead.Nome} - R$ ${vendaCompleta}`);
    }
    
    return isVendaCompleta;
  });

  const vendasRecorrentes = leads.filter(lead => {
    const recorrente = parseMonetaryValue(lead.recorrente);
    const isRecorrente = recorrente > 0;
    
    if (isRecorrente) {
      console.log(`🔄 [METRICS] Venda Recorrente encontrada: ${lead.Nome} - R$ ${recorrente}`);
    }
    
    return isRecorrente;
  });

  // CORREÇÃO CRÍTICA: Calcular receitas com validação
  const receitaCompleta = vendasCompletas.reduce((total, lead) => {
    const valor = parseMonetaryValue(lead['Venda Completa']);
    return total + valor;
  }, 0);

  const receitaRecorrente = vendasRecorrentes.reduce((total, lead) => {
    const valor = parseMonetaryValue(lead.recorrente);
    return total + valor;
  }, 0);

  const receitaTotal = receitaCompleta + receitaRecorrente;

  // CORREÇÃO CRÍTICA: Calcular fechamentos corretamente
  const fechamentos = vendasCompletas.length + vendasRecorrentes.length;
  const fechados = leads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const isFechado = ['fechado', 'vendido', 'comprou'].some(s => status.includes(s));
    const temVenda = parseMonetaryValue(lead['Venda Completa']) > 0 || parseMonetaryValue(lead.recorrente) > 0;
    return isFechado || temVenda;
  });

  // Cálculos de taxas
  const totalLeads = leads.length;
  const totalCompareceram = compareceram.length;
  const totalFechamentos = Math.max(fechamentos, fechados.length);

  const taxaFechamento = totalLeads > 0 ? (totalFechamentos / totalLeads) * 100 : 0;
  const taxaComparecimento = agendamentos.length > 0 ? (totalCompareceram / agendamentos.length) * 100 : 0;
  const aproveitamentoGeral = totalCompareceram > 0 ? (totalFechamentos / totalCompareceram) * 100 : 0;
  const ticketMedio = totalFechamentos > 0 ? receitaTotal / totalFechamentos : 0;

  const metrics: Metrics = {
    totalLeads,
    agendamentos: agendamentos.length,
    confirmados: confirmados.length,
    apresentacoes: totalCompareceram,
    compareceram: totalCompareceram,
    noShows: noShows.length,
    remarcacoes: 0,
    fechamentos: totalFechamentos,
    fechados: fechados.length,
    vendasCompletas: vendasCompletas.length,
    vendasRecorrentes: vendasRecorrentes.length,
    receitaTotal,
    receitaCompleta,
    receitaRecorrente,
    taxaFechamento,
    taxaComparecimento,
    aproveitamentoGeral,
    ticketMedio,
    taxaDesmarque: 0,
    taxaNaoFechamento: 0,
    aSerAtendido: 0,
    atendidoNaoFechou: 0,
    perdidoInativo: 0
  };

  console.log('✅ [METRICS] Métricas calculadas (CORRIGIDAS):');
  console.log('💰 [METRICS] - Receita Total:', receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('📊 [METRICS] - Fechamentos:', totalFechamentos);
  console.log('📈 [METRICS] - Taxa Fechamento:', taxaFechamento.toFixed(2) + '%');

  return metrics;
}
