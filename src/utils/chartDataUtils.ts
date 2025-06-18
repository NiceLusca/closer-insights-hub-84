import { format, subDays, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseNumber } from "@/utils/field/valueParser";
import type { Lead } from "@/types/lead";

export function generateLeadsChartData(leads: Lead[]) {
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  return last30Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Incluir leads com data válida OU usar fallback de created_at/timestamp
    const dayLeads = leads.filter(lead => {
      // Primeiro, tentar usar parsedDate
      if (lead.parsedDate && isValid(lead.parsedDate)) {
        return format(lead.parsedDate, 'yyyy-MM-dd') === dateStr;
      }
      
      // Fallback: usar data original se possível
      if (lead.data) {
        try {
          const leadDate = new Date(lead.data);
          if (isValid(leadDate)) {
            return format(leadDate, 'yyyy-MM-dd') === dateStr;
          }
        } catch (e) {
          // Continuar para próximo fallback
        }
      }
      
      // Último fallback: usar row_number para distribuir uniformemente
      // Isso garante que leads apareçam nos gráficos mesmo sem data válida
      if (!lead.parsedDate && lead.row_number) {
        const dayIndex = (lead.row_number - 1) % 30;
        const leadDay = subDays(new Date(), 29 - dayIndex);
        return format(leadDay, 'yyyy-MM-dd') === dateStr;
      }
      
      return false;
    });

    const agendados = dayLeads.filter(lead => 
      ['Agendado', 'Confirmado'].includes(lead.Status || '')
    ).length;
    
    const fechamentos = dayLeads.filter(lead => 
      lead.Status === 'Fechou'
    ).length;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      total: dayLeads.length,
      agendados,
      fechamentos
    };
  });
}

export function generateStatusDistributionData(leads: Lead[]) {
  // Incluir TODOS os leads, excluindo apenas mentorados
  const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  
  const statusCount: Record<string, number> = {};
  
  filteredLeads.forEach(lead => {
    const status = lead.Status || 'Sem Status';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const total = filteredLeads.length;
  
  return Object.entries(statusCount)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.value - a.value);
}

// Função para extrair origem usando a MESMA lógica do MonthlyRevenueHistory
function extractOriginFromLead(lead: Lead): string {
  const leadAny = lead as any;
  
  // Primeiro, verificar campo 'origem' padrão
  if (lead.origem && lead.origem.trim()) {
    return lead.origem.trim();
  }
  
  // Depois, verificar campo 'Origem' (com O maiúsculo)
  if (leadAny.Origem && leadAny.Origem.trim()) {
    return leadAny.Origem.trim();
  }
  
  // Verificar outros campos possíveis
  const alternativeFields = ['origem_campanha', 'source', 'utm_source', 'campaign_source'];
  for (const field of alternativeFields) {
    if (leadAny[field] && leadAny[field].trim()) {
      return leadAny[field].trim();
    }
  }
  
  return 'Origem Desconhecida';
}

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE DETALHADA INÍCIO ===');
  console.log('🎯 [ORIGIN ANALYSIS] Total de leads BRUTOS recebidos:', leads.length);
  
  // PASSO 1: Filtrar apenas mentorados (manter todos os outros)
  const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  console.log('🎯 [ORIGIN ANALYSIS] Leads após filtro (sem mentorados):', filteredLeads.length);
  console.log('🎯 [ORIGIN ANALYSIS] Leads removidos (mentorados):', leads.length - filteredLeads.length);
  
  // PASSO 2: Análise detalhada dos leads com "1k"
  const leads1kTotal = leads.filter(lead => {
    const origem = extractOriginFromLead(lead);
    return origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr');
  });
  console.log('🎯 [ORIGIN ANALYSIS] Leads "1k/PLR" no dataset TOTAL:', leads1kTotal.length);
  
  const leads1kFiltrados = filteredLeads.filter(lead => {
    const origem = extractOriginFromLead(lead);
    return origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr');
  });
  console.log('🎯 [ORIGIN ANALYSIS] Leads "1k/PLR" APÓS filtro:', leads1kFiltrados.length);
  
  // Log detalhado dos leads 1k
  console.log('🎯 [ORIGIN ANALYSIS] Detalhes dos leads "1k/PLR":');
  leads1kTotal.forEach((lead, index) => {
    const origem = extractOriginFromLead(lead);
    const isMentorado = lead.Status === 'Mentorado';
    console.log(`  ${index + 1}. ${lead.Nome} - Status: ${lead.Status} - Origem: "${origem}" - Mentorado: ${isMentorado} - Data: ${lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'}`);
  });
  
  // PASSO 3: Análise por mês dos leads "1k"
  const leads1kPorMes = {};
  leads1kFiltrados.forEach(lead => {
    if (lead.parsedDate) {
      const mes = lead.parsedDate.getMonth(); // 0-based
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesNome = nomes[mes];
      leads1kPorMes[mesNome] = (leads1kPorMes[mesNome] || 0) + 1;
    }
  });
  console.log('🎯 [ORIGIN ANALYSIS] Leads "1k/PLR" por mês:', leads1kPorMes);
  
  // PASSO 4: Processar origens usando a nova função
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach((lead, index) => {
    const origem = extractOriginFromLead(lead);
    
    // Log para leads específicos com "1k" ou primeiros 10
    if (index < 10 || origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr')) {
      console.log(`🎯 [ORIGIN ANALYSIS] Lead ${index + 1} processado:`, {
        Nome: lead.Nome,
        Status: lead.Status,
        origemExtraida: origem,
        data: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'
      });
    }
    
    if (!originStats[origem]) {
      originStats[origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[origem].leads++;
    
    if (lead.Status === 'Fechou') {
      originStats[origem].vendas++;
      
      // CORREÇÃO: Somar tanto Venda Completa quanto recorrente
      const vendaCompleta = parseNumber(lead['Venda Completa']) || 0;
      const recorrente = parseNumber(lead.recorrente) || 0;
      const receitaTotal = vendaCompleta + recorrente;
      
      originStats[origem].receita += receitaTotal;
      
      // Log para vendas fechadas
      if (receitaTotal > 0 && origem.toLowerCase().includes('1k')) {
        console.log(`💰 [ORIGIN ANALYSIS] Venda "1k" processada - Lead: ${lead.Nome}, Venda: R$ ${vendaCompleta}, Recorrente: R$ ${recorrente}, Total: R$ ${receitaTotal}`);
      }
    }
  });

  const totalLeads = filteredLeads.length;
  console.log(`📊 [ORIGIN ANALYSIS] Total de leads válidos para análise: ${totalLeads}`);
  console.log(`📊 [ORIGIN ANALYSIS] Origens únicas encontradas: ${Object.keys(originStats).length}`);
  console.log(`📊 [ORIGIN ANALYSIS] Lista de origens:`, Object.keys(originStats));

  // Verificar especificamente se "1k" está nas estatísticas
  const origensComIk = Object.keys(originStats).filter(origem => 
    origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr')
  );
  console.log(`📊 [ORIGIN ANALYSIS] Origens com "1k/PLR" nas estatísticas:`, origensComIk);
  origensComIk.forEach(origem => {
    console.log(`📊 [ORIGIN ANALYSIS] - ${origem}: ${originStats[origem].leads} leads, ${originStats[origem].vendas} vendas, R$ ${originStats[origem].receita.toFixed(2)}`);
  });

  // Mostrar TODAS as origens
  const allOrigins = Object.entries(originStats)
    .map(([origem, stats]) => {
      return {
        origem: origem.length > 20 ? origem.substring(0, 20) + '...' : origem,
        leads: stats.leads,
        vendas: stats.vendas,
        conversao: stats.leads > 0 ? Number(((stats.vendas / stats.leads) * 100).toFixed(1)) : 0,
        receita: stats.receita,
        percentage: totalLeads > 0 ? Number(((stats.leads / totalLeads) * 100).toFixed(1)) : 0
      };
    })
    .sort((a, b) => b.leads - a.leads); // Ordenar por número de leads

  console.log(`📊 [ORIGIN ANALYSIS] Resultado final - ${allOrigins.length} origens processadas:`);
  allOrigins.forEach((origem, index) => {
    if (index < 10 || origem.origem.toLowerCase().includes('1k') || origem.origem.toLowerCase().includes('plr')) {
      console.log(`📊 [ORIGIN ANALYSIS] ${index + 1}. ${origem.origem}: ${origem.leads} leads (${origem.percentage}%), ${origem.vendas} vendas, R$ ${origem.receita.toFixed(2)}`);
    }
  });

  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE DETALHADA FIM ===');
  return allOrigins;
}
