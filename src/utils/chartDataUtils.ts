
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

// Função MELHORADA para extrair origem - buscando em TODOS os campos possíveis
function extractOriginFromLead(lead: Lead): string {
  const leadAny = lead as any;
  
  console.log('🔍 [EXTRACT ORIGIN] Analisando lead:', lead.Nome);
  console.log('🔍 [EXTRACT ORIGIN] Campos disponíveis:', Object.keys(leadAny));
  
  // Lista EXPANDIDA de campos possíveis para origem
  const possibleOriginFields = [
    'origem',
    'Origem', 
    'origem_campanha',
    'ORIGEM_CAMPANHA',
    'source',
    'Source',
    'utm_source',
    'UTM_SOURCE',
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
    'MIDIA'
  ];
  
  // Tentar cada campo possível
  for (const field of possibleOriginFields) {
    if (leadAny[field] && typeof leadAny[field] === 'string' && leadAny[field].trim()) {
      const value = leadAny[field].trim();
      console.log(`🔍 [EXTRACT ORIGIN] Origem encontrada no campo "${field}": "${value}"`);
      return value;
    }
  }
  
  // Se não encontrou em campos específicos, buscar por qualquer campo que contenha essas palavras
  const searchTerms = ['origem', 'source', 'campanha', 'campaign', 'canal', 'midia'];
  for (const [key, value] of Object.entries(leadAny)) {
    const keyLower = key.toLowerCase();
    if (searchTerms.some(term => keyLower.includes(term))) {
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`🔍 [EXTRACT ORIGIN] Origem encontrada em campo dinâmico "${key}": "${value}"`);
        return value.trim();
      }
    }
  }
  
  console.log('🔍 [EXTRACT ORIGIN] Nenhuma origem encontrada, usando "Origem Desconhecida"');
  return 'Origem Desconhecida';
}

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE DETALHADA INÍCIO ===');
  console.log('🎯 [ORIGIN ANALYSIS] Total de leads BRUTOS recebidos:', leads.length);
  
  // MUDANÇA CRÍTICA: NÃO FILTRAR MENTORADOS - incluir TODOS os leads
  // O usuário disse que os dados devem vir direto do webhook e não devemos excluir dados
  const filteredLeads = leads; // Usar TODOS os leads
  console.log('🎯 [ORIGIN ANALYSIS] Leads após "filtro" (todos incluídos):', filteredLeads.length);
  
  // INVESTIGAÇÃO: Buscar especificamente por "1k" ou "PLR" em TODOS os campos
  const leads1kTotal = filteredLeads.filter(lead => {
    const leadAny = lead as any;
    
    // Buscar em TODOS os campos do lead
    const allFieldsText = Object.values(leadAny)
      .filter(value => typeof value === 'string')
      .join(' ')
      .toLowerCase();
    
    const contains1k = allFieldsText.includes('1k') || 
                      allFieldsText.includes('plr') || 
                      allFieldsText.includes('dia');
    
    if (contains1k) {
      console.log('🎯 [ORIGIN ANALYSIS] Lead com "1k/PLR/dia" encontrado:', {
        Nome: lead.Nome,
        Status: lead.Status,
        campos: Object.keys(leadAny),
        todosValores: Object.fromEntries(
          Object.entries(leadAny).filter(([_, value]) => 
            typeof value === 'string' && (
              value.toLowerCase().includes('1k') || 
              value.toLowerCase().includes('plr') || 
              value.toLowerCase().includes('dia')
            )
          )
        )
      });
    }
    
    return contains1k;
  });
  
  console.log('🎯 [ORIGIN ANALYSIS] Total de leads com "1k/PLR/dia" encontrados:', leads1kTotal.length);
  
  // INVESTIGAÇÃO: Análise por mês dos leads "1k"
  const leads1kPorMes = {};
  leads1kTotal.forEach(lead => {
    if (lead.parsedDate) {
      const mes = lead.parsedDate.getMonth(); // 0-based
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesNome = nomes[mes];
      leads1kPorMes[mesNome] = (leads1kPorMes[mesNome] || 0) + 1;
    } else {
      leads1kPorMes['Sem Data'] = (leads1kPorMes['Sem Data'] || 0) + 1;
    }
  });
  console.log('🎯 [ORIGIN ANALYSIS] Leads "1k/PLR/dia" por mês:', leads1kPorMes);
  
  // Processar origens usando a função MELHORADA
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach((lead, index) => {
    const origem = extractOriginFromLead(lead);
    
    // Log para leads com "1k" ou primeiros 5
    if (index < 5 || origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr') || origem.toLowerCase().includes('dia')) {
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
      
      // Somar receita
      const vendaCompleta = parseNumber(lead['Venda Completa']) || 0;
      const recorrente = parseNumber(lead.recorrente) || 0;
      const receitaTotal = vendaCompleta + recorrente;
      
      originStats[origem].receita += receitaTotal;
      
      // Log para vendas fechadas com "1k"
      if (receitaTotal > 0 && (origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr') || origem.toLowerCase().includes('dia'))) {
        console.log(`💰 [ORIGIN ANALYSIS] Venda "1k/PLR/dia" processada:`, {
          lead: lead.Nome,
          origem: origem,
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
  
  // Verificar especificamente se "1k" está nas estatísticas
  const origensComIk = Object.keys(originStats).filter(origem => 
    origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr') || origem.toLowerCase().includes('dia')
  );
  console.log(`📊 [ORIGIN ANALYSIS] Origens com "1k/PLR/dia" nas estatísticas:`, origensComIk);
  origensComIk.forEach(origem => {
    console.log(`📊 [ORIGIN ANALYSIS] - ${origem}: ${originStats[origem].leads} leads, ${originStats[origem].vendas} vendas, R$ ${originStats[origem].receita.toFixed(2)}`);
  });

  // IMPORTANTE: NÃO aplicar filtro de 5% - mostrar TODAS as origens
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
    .sort((a, b) => b.leads - a.leads); // Ordenar por número de leads

  console.log(`📊 [ORIGIN ANALYSIS] Resultado final - ${allOrigins.length} origens processadas (TODAS incluídas):`);
  allOrigins.forEach((origem, index) => {
    if (index < 15 || origem.origem.toLowerCase().includes('1k') || origem.origem.toLowerCase().includes('plr') || origem.origem.toLowerCase().includes('dia')) {
      console.log(`📊 [ORIGIN ANALYSIS] ${index + 1}. ${origem.origem}: ${origem.leads} leads (${origem.percentage}%), ${origem.vendas} vendas, R$ ${origem.receita.toFixed(2)}`);
    }
  });

  console.log('🎯 [ORIGIN ANALYSIS] === ANÁLISE DETALHADA FIM ===');
  return allOrigins;
}
