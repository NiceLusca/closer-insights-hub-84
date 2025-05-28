
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

  leads.forEach(lead => {
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

  const totalLeads = leads.length;
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  // Cálculos de taxas (seguindo as definições do briefing)
  // Taxa de Comparecimento = Agendados ÷ (Agendados + No-Shows)
  const baseComparecimento = agendamentos + noShows;
  const taxaComparecimento = baseComparecimento > 0 ? (agendamentos / baseComparecimento) * 100 : 0;
  
  // Taxa de Fechamento = Fechou ÷ Total de Apresentações
  // Considerando apresentações como leads que não são mentorados
  const totalApresentacoes = totalLeads - mentorados;
  const taxaFechamento = totalApresentacoes > 0 ? (fechamentos / totalApresentacoes) * 100 : 0;
  
  // Taxa de Desmarque = Desmarcou ÷ Agendados
  const taxaDesmarque = agendamentos > 0 ? (desmarcados / agendamentos) * 100 : 0;
  
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

  console.log('📈 Métricas calculadas:', metrics);
  return metrics;
}
