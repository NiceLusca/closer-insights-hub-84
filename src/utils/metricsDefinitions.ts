
import { parseNumber } from "@/utils/field/valueParser";
import type { Lead, Metrics } from "@/types/lead";

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
  
  // Analisar status únicos
  const statusUnicos = [...new Set(validLeads.map(lead => lead.Status).filter(Boolean))].sort();
  console.log('📊 [METRICS] Status únicos encontrados:', statusUnicos);
  
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
  
  // MUDANÇA CRÍTICA: Cálculo de fechamentos mais flexível
  let fechamentos = 0;
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
    
    // Considerar como fechamento se: Status "Fechou" OU tem receita registrada
    const temReceita = vendaCompleta > 0 || recorrente > 0;
    const statusFechou = statusValue === 'Fechou';
    
    if (statusFechou || temReceita) {
      fechamentos++;
      
      if (vendaCompleta > 0) {
        vendasCompletas++;
        receitaCompleta += vendaCompleta;
      }
      
      if (recorrente > 0) {
        vendasRecorrentes++;
        receitaRecorrente += recorrente;
      }
      
      receitaTotal += vendaCompleta + recorrente;
      
      if (isTargetLead) {
        console.log(`✅ [METRICS] VENDA CONTABILIZADA - ${lead.Nome}:`, {
          fechamentos: fechamentos,
          receitaTotal: receitaTotal,
          vendaCompleta: vendaCompleta,
          recorrente: recorrente
        });
      }
    } else if (isTargetLead) {
      console.log(`❌ [METRICS] VENDA NÃO CONTABILIZADA - ${lead.Nome}:`, {
        motivo: 'Sem status "Fechou" e sem receita registrada'
      });
    }
  });
  
  // Calcular taxas
  const totalLeads = validLeads.length;
  const taxaComparecimento = totalLeads > 0 ? Number(((totalLeads - noShows) / totalLeads * 100).toFixed(1)) : 0;
  const taxaFechamento = totalLeads > 0 ? Number((fechamentos / totalLeads * 100).toFixed(1)) : 0;
  const taxaDesmarque = totalLeads > 0 ? Number((noShows / totalLeads * 100).toFixed(1)) : 0;
  const aproveitamentoGeral = totalLeads > 0 ? Number((fechamentos / totalLeads * 100).toFixed(1)) : 0;
  
  const mentorados = leads.filter(lead => lead.Status === 'Mentorado').length;
  
  const metrics: Metrics = {
    totalLeads,
    agendamentos: agendados,
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
  
  console.log('📊 [METRICS] === RESULTADO FINAL DAS MÉTRICAS ===');
  console.log('📊 [METRICS] Métricas calculadas:', {
    totalLeads: metrics.totalLeads,
    fechamentos: metrics.fechamentos,
    receitaTotal: metrics.receitaTotal.toFixed(2),
    vendasCompletas: metrics.vendasCompletas,
    vendasRecorrentes: metrics.vendasRecorrentes,
    receitaCompleta: metrics.receitaCompleta.toFixed(2),
    receitaRecorrente: metrics.receitaRecorrente.toFixed(2),
    taxaFechamento: metrics.taxaFechamento
  });
  console.log('📊 [METRICS] === CÁLCULO DETALHADO DE MÉTRICAS FIM ===');
  
  return metrics;
}
