
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

export function generateOriginAnalysisData(leads: Lead[]) {
  console.log('🔍 [ORIGIN DEBUG] === ANÁLISE DETALHADA DE ORIGENS ===');
  console.log('🔍 [ORIGIN DEBUG] Total de leads recebidos:', leads.length);
  
  // Log de amostra de leads para verificar campos disponíveis
  const sampleLeads = leads.slice(0, 5);
  console.log('🔍 [ORIGIN DEBUG] Amostra de leads (primeiros 5):');
  sampleLeads.forEach((lead, index) => {
    console.log(`🔍 [ORIGIN DEBUG] Lead ${index + 1}:`, {
      Nome: lead.Nome,
      Status: lead.Status,
      origem: lead.origem,
      Origem: lead.Origem,
      'Venda Completa': lead['Venda Completa'],
      recorrente: lead.recorrente,
      allFields: Object.keys(lead)
    });
  });
  
  // Verificar todos os campos que podem conter origem
  const originFields = ['origem', 'Origem', 'origem_campanha', 'source', 'utm_source'];
  console.log('🔍 [ORIGIN DEBUG] Verificando campos de origem:', originFields);
  
  // Incluir TODOS os leads, excluindo apenas mentorados
  const filteredLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  console.log('🔍 [ORIGIN DEBUG] Leads após filtro (sem mentorados):', filteredLeads.length);
  
  // Verificar todas as origens encontradas nos diferentes campos
  const origensEncontradas = new Set();
  filteredLeads.forEach(lead => {
    originFields.forEach(field => {
      if (lead[field]) {
        origensEncontradas.add(`${field}: ${lead[field]}`);
      }
    });
  });
  console.log('🔍 [ORIGIN DEBUG] Todas as origens encontradas por campo:', Array.from(origensEncontradas));
  
  // Buscar especificamente por "1k por dia" ou variações
  const leads1kPorDia = filteredLeads.filter(lead => {
    const origemTexto = (lead.origem || '').toLowerCase();
    const OrigemTexto = (lead.Origem || '').toLowerCase();
    return origemTexto.includes('1k') || origemTexto.includes('plr') || 
           OrigemTexto.includes('1k') || OrigemTexto.includes('plr');
  });
  console.log('🔍 [ORIGIN DEBUG] Leads encontrados com "1k" ou "plr":', leads1kPorDia.length);
  leads1kPorDia.forEach(lead => {
    console.log('🔍 [ORIGIN DEBUG] Lead 1k/PLR:', {
      Nome: lead.Nome,
      Status: lead.Status,
      origem: lead.origem,
      Origem: lead.Origem
    });
  });
  
  const originStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
  
  filteredLeads.forEach((lead, index) => {
    // Tentar múltiplos campos para origem
    let origem = lead.origem || lead.Origem || lead.origem_campanha || lead.source || lead.utm_source || 'Origem Desconhecida';
    
    // Log para leads específicos que estamos procurando
    if (index < 10 || origem.toLowerCase().includes('1k') || origem.toLowerCase().includes('plr')) {
      console.log(`🔍 [ORIGIN DEBUG] Lead ${index + 1} processado:`, {
        Nome: lead.Nome,
        Status: lead.Status,
        origemEscolhida: origem,
        camposOrigem: {
          origem: lead.origem,
          Origem: lead.Origem,
          origem_campanha: lead.origem_campanha,
          source: lead.source,
          utm_source: lead.utm_source
        }
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
      if (receitaTotal > 0) {
        console.log(`💰 [ORIGIN DEBUG] Venda processada - Origem: ${origem}, Lead: ${lead.Nome}, Venda: R$ ${vendaCompleta}, Recorrente: R$ ${recorrente}, Total: R$ ${receitaTotal}`);
      }
    }
  });

  const totalLeads = filteredLeads.length;
  console.log(`📊 [ORIGIN DEBUG] Total de leads válidos: ${totalLeads}`);
  console.log(`📊 [ORIGIN DEBUG] Origens encontradas:`, Object.keys(originStats));
  console.log(`📊 [ORIGIN DEBUG] Stats completas por origem:`, originStats);

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

  console.log(`📊 [ORIGIN DEBUG] Resultado final - ${allOrigins.length} origens processadas:`);
  allOrigins.forEach(origem => {
    console.log(`📊 [ORIGIN DEBUG] - ${origem.origem}: ${origem.leads} leads (${origem.percentage}%), ${origem.vendas} vendas, R$ ${origem.receita.toFixed(2)}`);
  });

  return allOrigins;
}
