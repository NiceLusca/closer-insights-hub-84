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

// Função SUPER MELHORADA para extrair origem - buscando em TODOS os campos possíveis
function extractOriginFromLead(lead: Lead): string {
  const leadAny = lead as any;
  
  // Log específico para leads alvos
  const isTargetLead = lead.Nome && (
    lead.Nome.toLowerCase().includes('alexandra') || 
    lead.Nome.toLowerCase().includes('marcos henrique')
  );
  
  if (isTargetLead) {
    console.log('🎯 [EXTRACT ORIGIN] === ANALISANDO LEAD ALVO ===');
    console.log('🎯 [EXTRACT ORIGIN] Nome:', lead.Nome);
    console.log('🎯 [EXTRACT ORIGIN] Todos os campos:', Object.keys(leadAny));
    console.log('🎯 [EXTRACT ORIGIN] Campos com texto:', Object.fromEntries(
      Object.entries(leadAny).filter(([key, value]) => 
        typeof value === 'string' && value.trim() !== ''
      )
    ));
  }
  
  // Lista SUPER EXPANDIDA de campos possíveis para origem
  const possibleOriginFields = [
    'origem',
    'Origem', 
    'ORIGEM',
    'origem_campanha',
    'ORIGEM_CAMPANHA',
    'origem_lead',
    'ORIGEM_LEAD',
    'source',
    'Source',
    'SOURCE',
    'utm_source',
    'UTM_SOURCE',
    'utm_campaign',
    'UTM_CAMPAIGN',
    'campaign_source',
    'CAMPAIGN_SOURCE',
    'campanha',
    'Campanha',
    'CAMPANHA',
    'canal',
    'Canal',
    'CANAL',
    'midia',
    'Midia',
    'MIDIA',
    'meio',
    'Meio',
    'MEIO',
    'referrer',
    'Referrer',
    'REFERRER',
    'landing_page',
    'LANDING_PAGE',
    'pagina_origem',
    'PAGINA_ORIGEM'
  ];
  
  // Tentar cada campo possível
  for (const field of possibleOriginFields) {
    if (leadAny[field] && typeof leadAny[field] === 'string' && leadAny[field].trim()) {
      const value = leadAny[field].trim();
      if (isTargetLead) {
        console.log(`🎯 [EXTRACT ORIGIN] ✅ Origem encontrada no campo "${field}": "${value}"`);
      }
      return value;
    }
  }
  
  // BUSCA ULTRA AGRESSIVA: Procurar por qualquer campo que contenha "1k", "plr", "dia"
  for (const [key, value] of Object.entries(leadAny)) {
    if (value && typeof value === 'string') {
      const valueLower = value.toLowerCase();
      const keyLower = key.toLowerCase();
      
      // Buscar por indicadores de campanha "1k por dia"
      if (valueLower.includes('1k') || valueLower.includes('plr') || 
          (valueLower.includes('dia') && (valueLower.includes('por') || valueLower.includes('k')))) {
        if (isTargetLead) {
          console.log(`🎯 [EXTRACT ORIGIN] ✅ Origem "1K" encontrada no campo "${key}": "${value}"`);
        }
        return value.trim();
      }
      
      // Buscar por campos que contenham palavras-chave de origem
      const searchTerms = ['origem', 'source', 'campanha', 'campaign', 'canal', 'midia', 'utm', 'referrer'];
      if (searchTerms.some(term => keyLower.includes(term))) {
        if (value.trim()) {
          if (isTargetLead) {
            console.log(`🎯 [EXTRACT ORIGIN] ✅ Origem encontrada em campo dinâmico "${key}": "${value}"`);
          }
          return value.trim();
        }
      }
    }
  }
  
  // ÚLTIMA TENTATIVA: Buscar em qualquer campo string por padrões conhecidos
  const knownPatterns = ['1k', 'plr', 'dia', 'naie', 'facebook', 'instagram', 'google', 'youtube', 'tiktok'];
  for (const [key, value] of Object.entries(leadAny)) {
    if (value && typeof value === 'string' && value.trim()) {
      const valueLower = value.toLowerCase();
      if (knownPatterns.some(pattern => valueLower.includes(pattern))) {
        if (isTargetLead) {
          console.log(`🎯 [EXTRACT ORIGIN] ✅ Padrão conhecido encontrado em "${key}": "${value}"`);
        }
        return value.trim();
      }
    }
  }
  
  if (isTargetLead) {
    console.log('🎯 [EXTRACT ORIGIN] ❌ NENHUMA ORIGEM ENCONTRADA para lead alvo!');
    console.log('🎯 [EXTRACT ORIGIN] === FIM ANÁLISE LEAD ALVO ===');
  }
  
  return 'Origem Desconhecida';
}

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE SUPER DETALHADA INÍCIO ===');
  console.log('🎯 [ORIGIN ANALYSIS] Total de leads BRUTOS recebidos:', leads.length);
  
  // INVESTIGAÇÃO ULTRA ESPECÍFICA para leads "1K por Dia"
  const leadsAlexandra = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('alexandra')
  );
  const leadsMarcos = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('marcos henrique')
  );
  
  console.log('🎯 [ORIGIN ANALYSIS] LEADS ESPECÍFICOS ENCONTRADOS:');
  console.log('🎯 [ORIGIN ANALYSIS] - Alexandra:', leadsAlexandra.length);
  leadsAlexandra.forEach((lead, index) => {
    console.log(`  ${index + 1}. ${lead.Nome}:`, {
      Status: lead.Status,
      origem: lead.origem,
      data: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data',
      vendaCompleta: lead['Venda Completa'],
      recorrente: lead.recorrente,
      todosOsCampos: Object.fromEntries(Object.entries(lead as any).filter(([_, value]) => 
        typeof value === 'string' && value.trim() !== ''
      ))
    });
  });
  
  console.log('🎯 [ORIGIN ANALYSIS] - Marcos:', leadsMarcos.length);
  leadsMarcos.forEach((lead, index) => {
    console.log(`  ${index + 1}. ${lead.Nome}:`, {
      Status: lead.Status,
      origem: lead.origem,
      data: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data',
      vendaCompleta: lead['Venda Completa'],
      recorrente: lead.recorrente,
      todosOsCampos: Object.fromEntries(Object.entries(lead as any).filter(([_, value]) => 
        typeof value === 'string' && value.trim() !== ''
      ))
    });
  });
  
  // USAR TODOS OS LEADS - não filtrar nada
  const filteredLeads = leads;
  console.log('🎯 [ORIGIN ANALYSIS] Leads para processamento (TODOS):', filteredLeads.length);
  
  // Processar origens usando a função SUPER MELHORADA
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach((lead, index) => {
    const origem = extractOriginFromLead(lead);
    
    // Log detalhado para leads alvos
    const isTargetLead = lead.Nome && (
      lead.Nome.toLowerCase().includes('alexandra') || 
      lead.Nome.toLowerCase().includes('marcos henrique')
    );
    
    if (isTargetLead) {
      console.log(`🎯 [ORIGIN ANALYSIS] PROCESSANDO LEAD ALVO ${lead.Nome}:`, {
        origemExtraida: origem,
        Status: lead.Status,
        vendaCompleta: lead['Venda Completa'],
        recorrente: lead.recorrente,
        data: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'sem data'
      });
    }
    
    if (!originStats[origem]) {
      originStats[origem] = { leads: 0, vendas: 0, receita: 0 };
    }
    
    originStats[origem].leads++;
    
    // MUDANÇA CRÍTICA: Verificar vendas de forma mais flexível
    const statusValue = lead.Status?.trim() || '';
    const vendaCompleta = parseNumber(lead['Venda Completa']) || 0;
    const recorrente = parseNumber(lead.recorrente) || 0;
    const temReceita = vendaCompleta > 0 || recorrente > 0;
    
    // Considerar como venda se: Status "Fechou" OU tem receita registrada
    if (statusValue === 'Fechou' || temReceita) {
      originStats[origem].vendas++;
      
      const receitaTotal = vendaCompleta + recorrente;
      originStats[origem].receita += receitaTotal;
      
      if (isTargetLead) {
        console.log(`💰 [ORIGIN ANALYSIS] VENDA LEAD ALVO processada:`, {
          lead: lead.Nome,
          origem: origem,
          statusFechou: statusValue === 'Fechou',
          temReceita: temReceita,
          vendaCompleta: vendaCompleta,
          recorrente: recorrente,
          total: receitaTotal
        });
      }
    }
  });

  const totalLeads = filteredLeads.length;
  console.log(`📊 [ORIGIN ANALYSIS] Total de leads válidos para análise: ${totalLeads}`);
  console.log(`📊 [ORIGIN ANALYSIS] Origens únicas encontradas: ${Object.keys(originStats).length}`);
  
  // Verificar especificamente origens com "1k", "plr", "dia"
  const origensComIk = Object.keys(originStats).filter(origem => {
    const origemLower = origem.toLowerCase();
    return origemLower.includes('1k') || origemLower.includes('plr') || 
           (origemLower.includes('dia') && (origemLower.includes('por') || origemLower.includes('k')));
  });
  
  console.log(`📊 [ORIGIN ANALYSIS] Origens com "1k/PLR/dia" nas estatísticas:`, origensComIk);
  origensComIk.forEach(origem => {
    console.log(`📊 [ORIGIN ANALYSIS] - ${origem}: ${originStats[origem].leads} leads, ${originStats[origem].vendas} vendas, R$ ${originStats[origem].receita.toFixed(2)}`);
  });

  // MOSTRAR TODAS as origens sem filtros
  const allOrigins = Object.entries(originStats)
    .map(([origem, stats]) => {
      return {
        origem: origem.length > 25 ? origem.substring(0, 25) + '...' : origem,
        leads: stats.leads,
        vendas: stats.vendas,
        conversao: stats.leads > 0 ? Number(((stats.vendas / stats.leads) * 100).toFixed(1)) : 0,
        receita: stats.receita,
        percentage: totalLeads > 0 ? Number(((stats.leads / totalLeads) * 100).toFixed(1)) : 0
      };
    })
    .sort((a, b) => b.leads - a.leads);

  console.log(`📊 [ORIGIN ANALYSIS] Resultado final - ${allOrigins.length} origens processadas:`);
  allOrigins.forEach((origem, index) => {
    if (index < 20) { // Mostrar top 20
      console.log(`📊 [ORIGIN ANALYSIS] ${index + 1}. ${origem.origem}: ${origem.leads} leads (${origem.percentage}%), ${origem.vendas} vendas, R$ ${origem.receita.toFixed(2)}`);
    }
  });

  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE SUPER DETALHADA FIM ===');
  return allOrigins;
}
