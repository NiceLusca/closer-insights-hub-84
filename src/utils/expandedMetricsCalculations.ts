
import type { Lead } from "@/types/lead";

export interface ExpandedMetrics {
  // Métricas básicas existentes
  totalLeads: number;
  fechamentos: number;
  receitaTotal: number;
  taxaFechamento: number;
  taxaComparecimento: number;
  aproveitamentoGeral: number;
  ticketMedio: number;
  noShows: number;
  remarcacoes: number;
  receitaRecorrente: number;
  receitaCompleta: number;
  
  // Novas métricas expandidas
  vendasRecorrentes: number;
  vendasCompletas: number;
  percentualRecorrencia: number;
  ticketMedioRecorrente: number;
  ticketMedioCompleto: number;
  tempoMedioFechamento: number;
  distribuicaoProdutos: { [key: string]: number };
  roiPorOrigem: number;
  leadsPorDia: number;
  conversaoRapida: number; // Fechamentos em até 7 dias
  conversaoLenta: number; // Fechamentos acima de 7 dias
}

export function calculateExpandedMetrics(leads: Lead[]): ExpandedMetrics {
  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      fechamentos: 0,
      receitaTotal: 0,
      taxaFechamento: 0,
      taxaComparecimento: 0,
      aproveitamentoGeral: 0,
      ticketMedio: 0,
      noShows: 0,
      remarcacoes: 0,
      receitaRecorrente: 0,
      receitaCompleta: 0,
      vendasRecorrentes: 0,
      vendasCompletas: 0,
      percentualRecorrencia: 0,
      ticketMedioRecorrente: 0,
      ticketMedioCompleto: 0,
      tempoMedioFechamento: 0,
      distribuicaoProdutos: {},
      roiPorOrigem: 0,
      leadsPorDia: 0,
      conversaoRapida: 0,
      conversaoLenta: 0
    };
  }

  const totalLeads = leads.length;
  const leadsCompareceu = leads.filter(lead => 
    lead.Status && ['Compareceu', 'Fechamento', 'Fechou'].includes(lead.Status)
  );
  const fechamentos = leads.filter(lead => 
    lead.Status && ['Fechamento', 'Fechou'].includes(lead.Status)
  );
  const noShows = leads.filter(lead => lead.Status === 'No Show').length;
  const remarcacoes = leads.filter(lead => lead.Status === 'Remarcado').length;

  // Calcular receitas
  let receitaTotal = 0;
  let receitaRecorrente = 0;
  let receitaCompleta = 0;
  let vendasRecorrentes = 0;
  let vendasCompletas = 0;

  fechamentos.forEach(lead => {
    const valor = parseFloat(lead.Valor?.toString().replace(/[^\d,.-]/g, '').replace(',', '.') || '0');
    receitaTotal += valor;
    
    if (lead.Produto && lead.Produto.toLowerCase().includes('recorrente')) {
      receitaRecorrente += valor;
      vendasRecorrentes++;
    } else {
      receitaCompleta += valor;
      vendasCompletas++;
    }
  });

  // Métricas básicas
  const taxaFechamento = totalLeads > 0 ? (fechamentos.length / totalLeads) * 100 : 0;
  const taxaComparecimento = totalLeads > 0 ? (leadsCompareceu.length / totalLeads) * 100 : 0;
  const aproveitamentoGeral = leadsCompareceu.length > 0 ? (fechamentos.length / leadsCompareceu.length) * 100 : 0;
  const ticketMedio = fechamentos.length > 0 ? receitaTotal / fechamentos.length : 0;

  // Novas métricas expandidas
  const percentualRecorrencia = fechamentos.length > 0 ? (vendasRecorrentes / fechamentos.length) * 100 : 0;
  const ticketMedioRecorrente = vendasRecorrentes > 0 ? receitaRecorrente / vendasRecorrentes : 0;
  const ticketMedioCompleto = vendasCompletas > 0 ? receitaCompleta / vendasCompletas : 0;

  // Distribuição por produtos
  const distribuicaoProdutos: { [key: string]: number } = {};
  fechamentos.forEach(lead => {
    const produto = lead.Produto || 'Não especificado';
    distribuicaoProdutos[produto] = (distribuicaoProdutos[produto] || 0) + 1;
  });

  // ROI por origem (receita total / total de leads)
  const roiPorOrigem = totalLeads > 0 ? receitaTotal / totalLeads : 0;

  // Leads por dia (baseado no período dos dados)
  const datasValidas = leads.filter(l => l.parsedDate).map(l => l.parsedDate!);
  const diasUnicos = datasValidas.length > 0 ? 
    new Set(datasValidas.map(d => d.toDateString())).size : 1;
  const leadsPorDia = diasUnicos > 0 ? totalLeads / diasUnicos : 0;

  // Tempo médio para fechamento (simplificado - seria necessário mais dados para cálculo preciso)
  const tempoMedioFechamento = 7; // Placeholder - implementar lógica real se houver dados de tempo

  // Conversões rápidas vs lentas (placeholder - precisaria de dados de tempo real)
  const conversaoRapida = Math.floor(fechamentos.length * 0.6);
  const conversaoLenta = fechamentos.length - conversaoRapida;

  return {
    totalLeads,
    fechamentos: fechamentos.length,
    receitaTotal,
    taxaFechamento,
    taxaComparecimento,
    aproveitamentoGeral,
    ticketMedio,
    noShows,
    remarcacoes,
    receitaRecorrente,
    receitaCompleta,
    vendasRecorrentes,
    vendasCompletas,
    percentualRecorrencia,
    ticketMedioRecorrente,
    ticketMedioCompleto,
    tempoMedioFechamento,
    distribuicaoProdutos,
    roiPorOrigem,
    leadsPorDia,
    conversaoRapida,
    conversaoLenta
  };
}
