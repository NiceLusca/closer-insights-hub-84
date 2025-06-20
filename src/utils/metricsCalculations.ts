
import type { Lead, Metrics } from "@/types/lead";

// Função auxiliar para formatação monetária - EXPORTADA
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

// CORREÇÃO CRÍTICA: Função MUITO mais flexível para conversão monetária
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(0, value);
  }
  
  if (typeof value === 'string' && value.trim()) {
    // Remover tudo exceto números, vírgulas e pontos
    let cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Casos especiais para formatos brasileiros
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Formato: 1.234,56 (brasileiro)
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato: 1,234.56 (internacional)
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Se só tem vírgula, assumir decimal brasileiro
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        cleaned = cleaned.replace(',', '.');
      } else {
        // Múltiplas vírgulas = separador de milhares
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    
    const parsed = parseFloat(cleaned);
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
  console.log('📊 [METRICS] === CORREÇÃO EMERGENCIAL FASE 1-2 ===');
  console.log('📊 [METRICS] Total leads recebidos:', leads.length);
  
  if (!leads || leads.length === 0) {
    return getDefaultMetrics();
  }

  // CORREÇÃO: Filtrar leads válidos (bem mais flexível)
  const validLeads = leads.filter(lead => 
    lead.Nome?.trim() || lead.Status?.trim() || lead.origem?.trim() || lead.Closer?.trim() || lead.data?.trim()
  );

  console.log('📊 [METRICS] Leads válidos para cálculo:', validLeads.length);

  // CORREÇÃO CRÍTICA: Detecção de status MUITO mais flexível
  const agendamentos = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['agendado', 'agendamento', 'agenda', 'marcado', 'confirmado'].some(s => status.includes(s));
  });

  const confirmados = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['confirmado', 'confirmação', 'confirma', 'ok'].some(s => status.includes(s));
  });

  const noShows = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['no show', 'noshow', 'não compareceu', 'faltou', 'ausente', 'não apareceu'].some(s => status.includes(s));
  });

  const compareceram = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['compareceu', 'apresentou', 'atendido', 'presente', 'veio'].some(s => status.includes(s));
  });

  // CORREÇÃO CRÍTICA: Detecção de fechamentos MUITO mais flexível
  const fechadosPorStatus = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['fechado', 'vendido', 'comprou', 'cliente', 'pago', 'fechou', 'venda', 'ativo'].some(s => status.includes(s));
  });

  // CORREÇÃO CRÍTICA: Calcular receitas com MÚLTIPLOS campos possíveis
  let receitaCompleta = 0;
  let receitaRecorrente = 0;
  let vendasCompletas = 0;
  let vendasRecorrentes = 0;

  validLeads.forEach(lead => {
    // Campos possíveis para venda completa
    const camposCompleta = [
      'Venda Completa', 'venda_completa', 'vendaCompleta', 
      'Valor', 'valor', 'Venda', 'venda', 'Preço', 'preço'
    ];
    
    let valorCompleta = 0;
    camposCompleta.forEach(campo => {
      const valor = parseMonetaryValue(lead[campo]);
      if (valor > valorCompleta) valorCompleta = valor;
    });

    // Campos possíveis para recorrente
    const camposRecorrente = [
      'recorrente', 'Recorrente', 'mensalidade', 'Mensalidade',
      'mensal', 'Mensal', 'assinatura', 'Assinatura'
    ];
    
    let valorRecorrente = 0;
    camposRecorrente.forEach(campo => {
      const valor = parseMonetaryValue(lead[campo]);
      if (valor > valorRecorrente) valorRecorrente = valor;
    });

    if (valorCompleta > 0) {
      receitaCompleta += valorCompleta;
      vendasCompletas++;
    }
    
    if (valorRecorrente > 0) {
      receitaRecorrente += valorRecorrente;
      vendasRecorrentes++;
    }
  });

  const receitaTotal = receitaCompleta + receitaRecorrente;

  // CORREÇÃO: Calcular fechamentos como máximo entre status e vendas
  const totalFechamentos = Math.max(fechadosPorStatus.length, vendasCompletas + vendasRecorrentes);

  const mentorados = validLeads.filter(lead => {
    const status = lead.Status?.toLowerCase()?.trim() || '';
    return ['mentorado', 'cliente', 'ativo', 'aluno', 'estudante'].some(s => status.includes(s));
  }).length;

  // Calcular taxas
  const totalLeads = validLeads.length;
  const totalCompareceram = Math.max(compareceram.length, totalFechamentos); // Quem fechou, compareceu
  const totalAgendamentos = Math.max(agendamentos.length, totalCompareceram); // Quem compareceu, agendou

  const taxaFechamento = totalLeads > 0 ? (totalFechamentos / totalLeads) * 100 : 0;
  const taxaComparecimento = totalAgendamentos > 0 ? (totalCompareceram / totalAgendamentos) * 100 : 0;
  const aproveitamentoGeral = totalCompareceram > 0 ? (totalFechamentos / totalCompareceram) * 100 : 0;
  const ticketMedio = totalFechamentos > 0 ? receitaTotal / totalFechamentos : 0;

  const metrics: Metrics = {
    totalLeads,
    agendamentos: Math.max(agendamentos.length, totalCompareceram),
    confirmados: confirmados.length,
    apresentacoes: totalCompareceram,
    compareceram: totalCompareceram,
    noShows: noShows.length,
    remarcacoes: 0,
    fechamentos: totalFechamentos,
    fechados: fechadosPorStatus.length,
    vendasCompletas,
    vendasRecorrentes,
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

  console.log('✅ [METRICS] MÉTRICAS CORRIGIDAS (EMERGENCIAL):');
  console.log('💰 [METRICS] - Receita Total:', formatCurrency(receitaTotal));
  console.log('📊 [METRICS] - Fechamentos:', totalFechamentos);
  console.log('📈 [METRICS] - Taxa Fechamento:', taxaFechamento.toFixed(2) + '%');
  console.log('👥 [METRICS] - Mentorados:', mentorados);
  console.log('🎯 [METRICS] - Ticket Médio:', formatCurrency(ticketMedio));

  return metrics;
}
