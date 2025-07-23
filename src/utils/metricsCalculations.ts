
import type { Lead, Metrics } from "@/types/lead";

// Função auxiliar para formatação monetária - EXPORTADA
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

// FASE 4: Função SUPER flexível para conversão monetária
function parseMonetaryValue(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(0, value);
  }
  
  if (typeof value === 'string' && value.trim()) {
    let cleaned = value.trim();
    
    // CORREÇÃO FASE 7: Detectar e tratar valores zerados explicitamente
    if (cleaned === '0' || cleaned === '-' || cleaned === 'R$ 0' || cleaned === 'R$ 0,00') {
      return 0;
    }
    
    // Remover símbolos de moeda, espaços, e caracteres especiais
    cleaned = cleaned.replace(/[R$\s]/g, '');
    
    // NOVO: Lógica super robusta para formatos brasileiros e internacionais
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Determinar qual é decimal baseado na posição
      const lastCommaIndex = cleaned.lastIndexOf(',');
      const lastDotIndex = cleaned.lastIndexOf('.');
      
      if (lastCommaIndex > lastDotIndex) {
        // Formato brasileiro: 1.500,50
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato internacional: 1,500.50
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Só vírgula presente
      const commaParts = cleaned.split(',');
      if (commaParts.length === 2 && commaParts[1].length <= 2) {
        // Provável decimal: 1500,50
        cleaned = cleaned.replace(',', '.');
      } else {
        // Provável separador de milhares: 1,500
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    
    // Tentar parsear múltiplos formatos
    const formats = [
      cleaned,
      cleaned.replace(/[^\d.]/g, ''), // Só números e pontos
      cleaned.replace(/[^\d]/g, ''), // Só números
    ];
    
    for (const format of formats) {
      const parsed = parseFloat(format);
      if (!isNaN(parsed) && parsed > 0) {
        return Math.max(0, parsed);
      }
    }
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
  console.log('📊 [METRICS] === FASE 7 - CÁLCULOS SUPER FLEXÍVEIS ===');
  console.log('📊 [METRICS] Total leads recebidos:', leads.length);
  
  if (!leads || leads.length === 0) {
    return getDefaultMetrics();
  }

  // FASE 4: Filtrar leads válidos (super inclusivo)
  const validLeads = leads.filter(lead => 
    lead.Nome?.trim() || 
    lead.Status?.trim() || 
    lead.origem?.trim() || 
    lead.Closer?.trim() ||
    lead.data?.trim()
  );

  console.log('📊 [METRICS] Leads válidos para cálculo:', validLeads.length);

  // FASE 4: Detecção de status SUPER flexível e abrangente
  const statusKeywords = {
    agendado: ['agendado', 'agendamento', 'agenda', 'marcado'],
    confirmado: ['confirmado', 'confirmação', 'confirma', 'ok', 'confirmou'],
    noShow: ['no show', 'noshow', 'não compareceu', 'faltou', 'ausente', 'não apareceu'],
    compareceu: ['compareceu', 'apresentou', 'atendido', 'presente', 'veio', 'participou'],
    fechado: ['fechou', 'fechado', 'vendido', 'comprou', 'cliente', 'pago', 'venda', 'ativo', 'vendeu']
  };

  const agendamentos = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return statusKeywords.agendado.some(keyword => status.includes(keyword));
  });

  const confirmados = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return statusKeywords.confirmado.some(keyword => status.includes(keyword));
  });

  const noShows = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return statusKeywords.noShow.some(keyword => status.includes(keyword));
  });

  const compareceram = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return statusKeywords.compareceu.some(keyword => status.includes(keyword));
  });

  const fechadosPorStatus = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return statusKeywords.fechado.some(keyword => status.includes(keyword));
  });

  // FASE 4: Calcular receitas com TODOS os campos possíveis
  let receitaCompleta = 0;
  let receitaRecorrente = 0;
  let vendasCompletas = 0;
  let vendasRecorrentes = 0;

  validLeads.forEach(lead => {
    // SUPER EXPANSIVO: Todos os campos possíveis para venda completa
    const camposCompleta = [
      'Venda Completa', 'venda_completa', 'vendaCompleta', 
      'Valor', 'valor', 'Venda', 'venda', 'Preço', 'preço',
      'Receita', 'receita', 'Receita Total', 'receita_total',
      'Faturamento', 'faturamento',
      '_valorOriginal' // Campo de debug
    ];
    
    let valorCompleta = 0;
    camposCompleta.forEach(campo => {
      if (lead[campo]) {
        const valor = parseMonetaryValue(lead[campo]);
        if (valor > valorCompleta) valorCompleta = valor;
      }
    });

    // SUPER EXPANSIVO: Todos os campos possíveis para recorrente
    const camposRecorrente = [
      'recorrente', 'Recorrente', 'mensalidade', 'Mensalidade',
      'mensal', 'Mensal', 'assinatura', 'Assinatura',
      'Valor Recorrente', 'valor_recorrente', 'ValorRecorrente',
      'Subscription', 'subscription',
      '_recorrenteOriginal' // Campo de debug
    ];
    
    let valorRecorrente = 0;
    camposRecorrente.forEach(campo => {
      if (lead[campo]) {
        const valor = parseMonetaryValue(lead[campo]);
        if (valor > valorRecorrente) valorRecorrente = valor;
      }
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

  // FASE 4: Calcular fechamentos como máximo entre diferentes métricas
  const totalFechamentos = Math.max(
    fechadosPorStatus.length, 
    vendasCompletas + vendasRecorrentes,
    validLeads.filter(lead => 
      parseMonetaryValue(lead.Valor || lead['Venda Completa'] || 0) > 0 ||
      parseMonetaryValue(lead.recorrente || 0) > 0
    ).length
  );

  const mentorados = validLeads.filter(lead => {
    const status = (lead.Status || '').toLowerCase().trim();
    return ['mentorado', 'cliente', 'ativo', 'aluno', 'estudante', 'member', 'membro'].some(s => status.includes(s));
  }).length;

  // FASE 4: Calcular taxas com lógica robusta
  const totalLeads = validLeads.length;
  const totalCompareceram = Math.max(compareceram.length, totalFechamentos);
  const totalAgendamentos = Math.max(agendamentos.length, totalCompareceram);

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

  console.log('✅ [METRICS] FASE 7 - MÉTRICAS SUPER FLEXÍVEIS:');
  console.log('💰 [METRICS] - Receita Total:', formatCurrency(receitaTotal));
  console.log('💰 [METRICS] - Receita Completa:', formatCurrency(receitaCompleta));
  console.log('💰 [METRICS] - Receita Recorrente:', formatCurrency(receitaRecorrente));
  console.log('📊 [METRICS] - Fechamentos:', totalFechamentos);
  console.log('📈 [METRICS] - Taxa Fechamento:', taxaFechamento.toFixed(2) + '%');
  console.log('👥 [METRICS] - Mentorados:', mentorados);
  console.log('🎯 [METRICS] - Ticket Médio:', formatCurrency(ticketMedio));

  return metrics;
}
