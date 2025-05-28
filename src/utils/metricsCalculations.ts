
import type { Lead, Metrics } from "@/types/lead";

export function calculateMetrics(leads: Lead[]): Metrics {
  console.log('📊 Calculando métricas para', leads.length, 'leads');
  
  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      agendamentos: 0,
      noShows: 0,
      remarcacoes: 0,
      fechamentos: 0,
      receitaTotal: 0,
      receitaRecorrente: 0,
      taxaComparecimento: 0,
      taxaFechamento: 0,
      taxaDesmarque: 0,
      confirmados: 0,
      mentorados: 0,
      aproveitamentoGeral: 0,
      vendasCompletas: 0,
      vendasRecorrentes: 0,
      receitaCompleta: 0
    };
  }

  // PRIMEIRO: Filtrar apenas leads com status válido (não vazio)
  const validLeads = leads.filter(lead => {
    const status = lead.Status?.trim();
    return status && status !== '';
  });

  console.log(`📈 Processando ${validLeads.length} leads com status válido de ${leads.length} total`);

  // Contadores básicos
  let agendamentos = 0;
  let noShows = 0;
  let remarcacoes = 0;
  let fechamentos = 0;
  let confirmados = 0;
  let mentorados = 0;
  let desmarcados = 0;
  let vendasCompletas = 0;
  let vendasRecorrentes = 0;
  
  // Receitas
  let receitaCompleta = 0;
  let receitaRecorrente = 0;

  validLeads.forEach(lead => {
    const status = lead.Status?.trim() || '';
    
    switch (status) {
      case 'Agendado':
        agendamentos++;
        break;
      case 'Não Apareceu':
        noShows++;
        break;
      case 'Remarcou':
      case 'Aguardando resposta':
        remarcacoes++;
        break;
      case 'Fechou':
        fechamentos++;
        break;
      case 'Confirmado':
        confirmados++;
        break;
      case 'Mentorado':
        mentorados++;
        break;
      case 'Desmarcou':
        desmarcados++;
        break;
    }

    // Calcular vendas completas
    if (lead['Venda Completa'] && lead['Venda Completa'] > 0) {
      vendasCompletas++;
      receitaCompleta += lead['Venda Completa'];
    }

    // Calcular vendas recorrentes
    const recorrente = typeof lead.recorrente === 'number' ? lead.recorrente : 
                      (typeof lead.recorrente === 'string' && lead.recorrente !== '') ? parseFloat(lead.recorrente) : 0;
    
    if (recorrente > 0) {
      vendasRecorrentes++;
      receitaRecorrente += recorrente;
    }
  });

  const totalLeads = validLeads.length; // Apenas leads com status válido
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  // Cálculos de taxas CORRIGIDOS
  // Taxa de Comparecimento = Confirmados + Agendados ÷ (Confirmados + Agendados + No-Shows)
  const baseComparecimento = confirmados + agendamentos + noShows;
  const compareceram = confirmados + agendamentos;
  const taxaComparecimento = baseComparecimento > 0 ? (compareceram / baseComparecimento) * 100 : 0;
  
  // Taxa de Fechamento = Fechou ÷ Total de Apresentações (excluindo Mentorados)
  const totalApresentacoes = totalLeads - mentorados;
  const taxaFechamento = totalApresentacoes > 0 ? (fechamentos / totalApresentacoes) * 100 : 0;
  
  // Taxa de Desmarque = Desmarcou ÷ (Agendados + Confirmados + Desmarcados)
  const baseDesmarque = agendamentos + confirmados + desmarcados;
  const taxaDesmarque = baseDesmarque > 0 ? (desmarcados / baseDesmarque) * 100 : 0;
  
  // Aproveitamento Geral = Fechamentos / (Total de Leads - Mentorados) * 100
  const aproveitamentoGeral = totalApresentacoes > 0 ? (fechamentos / totalApresentacoes) * 100 : 0;

  const metrics = {
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
    mentorados,
    aproveitamentoGeral,
    vendasCompletas,
    vendasRecorrentes,
    receitaCompleta
  };

  console.log('📈 Métricas calculadas (apenas status válidos):', metrics);
  return metrics;
}
