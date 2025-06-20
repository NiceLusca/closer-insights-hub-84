
import type { Lead, Metrics } from "@/types/lead";

// Função auxiliar para formatação monetária - EXPORTADA
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

// CORREÇÃO CRÍTICA: Função melhorada para conversão monetária
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(0, value);
  }
  
  if (typeof value === 'string' && value.trim()) {
    // Remover caracteres não numéricos, manter apenas números, vírgulas e pontos
    const cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Tratar diferentes formatos brasileiros
    let normalized = cleaned;
    
    // Se tem vírgula como decimal (formato brasileiro)
    if (normalized.includes(',') && !normalized.includes('.')) {
      normalized = normalized.replace(',', '.');
    }
    // Se tem ponto e vírgula (formato: 1.234,56)
    else if (normalized.includes('.') && normalized.includes(',')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  
  return 0;
}

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
    perdidoInativo: 0,
    mentorados: 0
  };
}

export function calculateMetrics(leads: Lead[]): Metrics {
  console.log('📊 [METRICS] === CÁLCULO CORRIGIDO (FASE 3) ===');
  console.log('📊 [METRICS] Total leads recebidos:', leads.length);
  
  if (!leads || leads.length === 0) {
    return getDefaultMetrics();
  }

  // CORREÇÃO: Filtrar leads válidos (com nome ou status)
  const validLeads = leads.filter(lead => 
    (lead.Nome && lead.Nome.trim()) || (lead.Status && lead.Status.trim())
  );

  console.log('📊 [METRICS] Leads válidos para cálculo:', validLeads.length);

  // Categorizar leads por status
  const agendamentos = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['agendado', 'agendamento', 'agenda'].some(s => status.includes(s));
  });

  const confirmados = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['confirmado', 'confirmação', 'confirma'].some(s => status.includes(s));
  });

  const noShows = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['no show', 'noshow', 'não compareceu', 'faltou', 'ausente'].some(s => status.includes(s));
  });

  const compareceram = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['compareceu', 'apresentou', 'atendido', 'presente'].some(s => status.includes(s));
  });

  // CORREÇÃO CRÍTICA: Calcular vendas com múltiplos campos
  const vendasCompletas = validLeads.filter(lead => {
    const campos = ['Venda Completa', 'venda_completa', 'vendaCompleta', 'Valor', 'valor'];
    return campos.some(campo => parseMonetaryValue(lead[campo]) > 0);
  });

  const vendasRecorrentes = validLeads.filter(lead => {
    const campos = ['recorrente', 'Recorrente', 'mensalidade', 'Mensalidade'];
    return campos.some(campo => parseMonetaryValue(lead[campo]) > 0);
  });

  // CORREÇÃO: Calcular receitas considerando múltiplos campos
  const receitaCompleta = validLeads.reduce((total, lead) => {
    const campos = ['Venda Completa', 'venda_completa', 'vendaCompleta', 'Valor', 'valor'];
    const valores = campos.map(campo => parseMonetaryValue(lead[campo]));
    const maiorValor = Math.max(...valores);
    return total + (maiorValor > 0 ? maiorValor : 0);
  }, 0);

  const receitaRecorrente = validLeads.reduce((total, lead) => {
    const campos = ['recorrente', 'Recorrente', 'mensalidade', 'Mensalidade'];
    const valores = campos.map(campo => parseMonetaryValue(lead[campo]));
    const maiorValor = Math.max(...valores);
    return total + (maiorValor > 0 ? maiorValor : 0);
  }, 0);

  const receitaTotal = receitaCompleta + receitaRecorrente;

  // Calcular fechamentos (leads que compraram)
  const fechados = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    const statusFechado = ['fechado', 'vendido', 'comprou', 'cliente', 'pago'].some(s => status.includes(s));
    
    const temVenda = ['Venda Completa', 'venda_completa', 'vendaCompleta', 'Valor', 'valor', 'recorrente', 'Recorrente'].some(campo => 
      parseMonetaryValue(lead[campo]) > 0
    );
    
    return statusFechado || temVenda;
  });

  const mentorados = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['mentorado', 'cliente', 'ativo', 'aluno'].some(s => status.includes(s));
  }).length;

  // Calcular taxas
  const totalLeads = validLeads.length;
  const totalCompareceram = compareceram.length;
  const totalFechamentos = Math.max(fechados.length, vendasCompletas.length + vendasRecorrentes.length);

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
    perdidoInativo: 0,
    mentorados
  };

  console.log('✅ [METRICS] Métricas calculadas (CORRIGIDAS):');
  console.log('💰 [METRICS] - Receita Total:', formatCurrency(receitaTotal));
  console.log('📊 [METRICS] - Fechamentos:', totalFechamentos);
  console.log('📈 [METRICS] - Taxa Fechamento:', taxaFechamento.toFixed(2) + '%');
  console.log('👥 [METRICS] - Mentorados:', mentorados);

  return metrics;
}
