
import { parseNumber } from "@/utils/field/valueParser";
import type { Lead, Metrics } from "@/types/lead";

// Interface para métricas padronizadas (mais detalhada)
export interface StandardizedMetrics extends Metrics {
  // Propriedades já estão definidas na interface Metrics
}

export function calculateStandardizedMetrics(leads: Lead[]): Metrics {
  console.log('📊 [METRICS] === CÁLCULO DETALHADO DE MÉTRICAS INÍCIO ===');
  console.log('📊 [METRICS] Total de leads recebidos:', leads.length);
  
  // INVESTIGAÇÃO ESPECÍFICA: Buscar leads "Alexandra" e "Marcos"
  const leadsAlexandra = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('alexandra')
  );
  const leadsMarcos = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('marcos henrique')
  );
  
  console.log('📊 [METRICS] LEADS ESPECÍFICOS nas métricas:');
  console.log('📊 [METRICS] - Alexandra:', leadsAlexandra.length);
  leadsAlexandra.forEach(lead => {
    console.log(`    ${lead.Nome}: Status="${lead.Status}", VendaCompleta=${lead['Venda Completa']}, Recorrente=${lead.recorrente}`);
  });
  console.log('📊 [METRICS] - Marcos:', leadsMarcos.length);
  leadsMarcos.forEach(lead => {
    console.log(`    ${lead.Nome}: Status="${lead.Status}", VendaCompleta=${lead['Venda Completa']}, Recorrente=${lead.recorrente}`);
  });
  
  // Filtrar leads excluindo apenas mentorados
  const validLeads = leads.filter(lead => {
    const status = lead.Status?.trim();
    return status !== 'Mentorado';
  });
  
  console.log('📊 [METRICS] Leads válidos (sem mentorados):', validLeads.length);
  
  // Contadores básicos
  const agendados = validLeads.filter(lead => 
    ['Agendado', 'Confirmado'].includes(lead.Status || '')
  ).length;
  
  const noShows = validLeads.filter(lead => 
    lead.Status === 'Não Apareceu'
  ).length;
  
  const remarcacoes = validLeads.filter(lead => 
    lead.Status === 'Remarcou'
  ).length;
  
  const confirmados = validLeads.filter(lead => 
    lead.Status === 'Confirmado'
  ).length;
  
  // Classificação de status
  let fechados = 0;
  let aSerAtendido = 0;
  let atendidoNaoFechou = 0;
  let perdidoInativo = 0;
  
  let receitaTotal = 0;
  let receitaRecorrente = 0;
  let receitaCompleta = 0;
  let vendasCompletas = 0;
  let vendasRecorrentes = 0;
  
  console.log('📊 [METRICS] === ANÁLISE DE VENDAS E RECEITA ===');
  
  validLeads.forEach((lead, index) => {
    const vendaCompleta = parseNumber(lead['Venda Completa']) || 0;
    const recorrente = parseNumber(lead.recorrente) || 0;
    const statusValue = lead.Status?.trim() || '';
    
    // Log detalhado para leads alvos
    const isTargetLead = lead.Nome && (
      lead.Nome.toLowerCase().includes('alexandra') || 
      lead.Nome.toLowerCase().includes('marcos henrique')
    );
    
    if (isTargetLead) {
      console.log(`💰 [METRICS] LEAD ALVO - ${lead.Nome}:`, {
        Status: statusValue,
        vendaCompleta: vendaCompleta,
        recorrente: recorrente,
        statusFechou: statusValue === 'Fechou',
        temReceita: vendaCompleta > 0 || recorrente > 0
      });
    }
    
    // Classificar por status
    const temReceita = vendaCompleta > 0 || recorrente > 0;
    const statusFechou = statusValue === 'Fechou';
    
    if (statusFechou || temReceita) {
      fechados++;
      
      if (vendaCompleta > 0) {
        vendasCompletas++;
        receitaCompleta += vendaCompleta;
      }
      
      if (recorrente > 0) {
        vendasRecorrentes++;
        receitaRecorrente += recorrente;
      }
      
      receitaTotal += vendaCompleta + recorrente;
    } else if (['Agendado', 'Confirmado', 'Remarcou'].includes(statusValue)) {
      aSerAtendido++;
    } else if (['Não Fechou'].includes(statusValue)) {
      atendidoNaoFechou++;
    } else {
      perdidoInativo++;
    }
  });
  
  // Métricas derivadas
  const totalLeads = validLeads.length;
  const apresentacoes = fechados + atendidoNaoFechou;
  const compareceram = apresentacoes;
  
  const taxaComparecimento = totalLeads > 0 ? Number(((apresentacoes / totalLeads) * 100).toFixed(1)) : 0;
  const taxaFechamento = apresentacoes > 0 ? Number((fechados / apresentacoes * 100).toFixed(1)) : 0;
  const taxaNaoFechamento = apresentacoes > 0 ? Number((atendidoNaoFechou / apresentacoes * 100).toFixed(1)) : 0;
  const taxaDesmarque = totalLeads > 0 ? Number((perdidoInativo / totalLeads * 100).toFixed(1)) : 0;
  const aproveitamentoGeral = totalLeads > 0 ? Number((fechados / totalLeads * 100).toFixed(1)) : 0;
  
  const ticketMedio = fechados > 0 ? receitaTotal / fechados : 0;
  const mentorados = leads.filter(lead => lead.Status === 'Mentorado').length;
  
  const metrics: Metrics = {
    // Contadores básicos
    totalLeads,
    agendamentos: agendados,
    noShows,
    remarcacoes,
    fechamentos: fechados,
    confirmados,
    mentorados,
    
    // Receita
    receitaTotal,
    receitaRecorrente,
    receitaCompleta,
    
    // Vendas
    vendasCompletas,
    vendasRecorrentes,
    
    // Taxas principais
    taxaComparecimento,
    taxaFechamento,
    taxaDesmarque,
    aproveitamentoGeral,
    taxaNaoFechamento,
    
    // Grupos de classificação
    fechados,
    aSerAtendido,
    atendidoNaoFechou,
    perdidoInativo,
    apresentacoes,
    compareceram,
    
    // Métricas adicionais
    ticketMedio
  };
  
  console.log('📊 [METRICS] === RESULTADO FINAL DAS MÉTRICAS ===');
  console.log('📊 [METRICS] Métricas calculadas:', {
    totalLeads: metrics.totalLeads,
    fechados: metrics.fechados,
    receitaTotal: metrics.receitaTotal.toFixed(2),
    vendasCompletas: metrics.vendasCompletas,
    vendasRecorrentes: metrics.vendasRecorrentes,
    taxaFechamento: metrics.taxaFechamento
  });
  console.log('📊 [METRICS] === CÁLCULO DETALHADO DE MÉTRICAS FIM ===');
  
  return metrics;
}

// Função de validação de consistência
export function validateMetricsConsistency(metrics: Metrics): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar se a soma dos grupos bate com o total
  const somaGrupos = metrics.fechados + metrics.aSerAtendido + metrics.atendidoNaoFechou + metrics.perdidoInativo;
  if (Math.abs(somaGrupos - metrics.totalLeads) > 0.1) {
    errors.push(`Soma dos grupos (${somaGrupos}) ≠ Total (${metrics.totalLeads})`);
  }
  
  // Verificar se apresentações = fechados + atendidoNaoFechou
  if (Math.abs(metrics.apresentacoes - (metrics.fechados + metrics.atendidoNaoFechou)) > 0.1) {
    errors.push(`Apresentações (${metrics.apresentacoes}) ≠ Fechados + Não Fecharam (${metrics.fechados + metrics.atendidoNaoFechou})`);
  }
  
  // Avisos para métricas questionáveis
  if (metrics.taxaDesmarque > 40) {
    warnings.push(`Taxa de desmarque muito alta: ${metrics.taxaDesmarque.toFixed(1)}%`);
  }
  
  if (metrics.taxaFechamento < 20 && metrics.apresentacoes > 5) {
    warnings.push(`Taxa de fechamento baixa: ${metrics.taxaFechamento.toFixed(1)}%`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
