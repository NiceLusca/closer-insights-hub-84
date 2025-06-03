
import type { Lead } from "@/types/lead";

export type StatusGroup = 'fechado' | 'aSerAtendido' | 'atendidoNaoFechou' | 'perdidoInativo' | 'mentorado';

export interface StatusGroupInfo {
  key: StatusGroup;
  label: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
}

export const STATUS_GROUPS: Record<StatusGroup, StatusGroupInfo> = {
  fechado: {
    key: 'fechado',
    label: 'Fechado',
    emoji: '✅',
    description: 'Leads que já compraram',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  aSerAtendido: {
    key: 'aSerAtendido',
    label: 'A Ser Atendido',
    emoji: '⏳',
    description: 'Leads no processo com potencial de conversão',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  atendidoNaoFechou: {
    key: 'atendidoNaoFechou',
    label: 'Atendido, Mas Não Fechou',
    emoji: '🕐',
    description: 'Leads que passaram pelo atendimento, mas não converteram',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  perdidoInativo: {
    key: 'perdidoInativo',
    label: 'Perdido ou Inativo',
    emoji: '❌',
    description: 'Leads que não compareceram, cancelaram ou sumiram',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  mentorado: {
    key: 'mentorado',
    label: 'Mentorado',
    emoji: '🎓',
    description: 'Leads mentorados (excluídos dos cálculos de conversão)',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  }
};

export function classifyLeadByStatus(status: string | undefined): StatusGroup {
  if (!status || status.trim() === '') {
    return 'aSerAtendido'; // Default para leads sem status
  }

  const normalizedStatus = status.trim();

  switch (normalizedStatus) {
    case 'Fechou':
      return 'fechado';
    
    case 'Agendado':
    case 'Confirmado':
    case 'Remarcou':
    case 'DCAUSENTE':
      return 'aSerAtendido';
    
    case 'Não Fechou':
    case 'Aguardando resposta':
      return 'atendidoNaoFechou';
    
    case 'Desmarcou':
    case 'Não Apareceu':
    case 'Não Atendeu': // Adicionando status que pode existir
    case 'Número errado':
    case 'Numero Errado': // Versão sem acento
      return 'perdidoInativo';
    
    case 'Mentorado':
      return 'mentorado';
    
    default:
      console.warn(`⚠️ [STATUS] Status não reconhecido: "${normalizedStatus}". Classificando como 'A Ser Atendido'.`);
      // Log para análise posterior
      console.log(`🔍 [STATUS DEBUG] Status não mapeado encontrado: "${normalizedStatus}"`);
      return 'aSerAtendido';
  }
}

export function getLeadsByStatusGroup(leads: Lead[], excludeMentorados: boolean = true): Record<StatusGroup, Lead[]> {
  const groups: Record<StatusGroup, Lead[]> = {
    fechado: [],
    aSerAtendido: [],
    atendidoNaoFechou: [],
    perdidoInativo: [],
    mentorado: []
  };

  // Analisar todos os status únicos primeiro
  const statusUnicos = [...new Set(leads.map(lead => lead.Status).filter(Boolean))];
  console.log('📊 [STATUS] Status únicos encontrados:', statusUnicos.sort());

  leads.forEach(lead => {
    const group = classifyLeadByStatus(lead.Status);
    groups[group].push(lead);
  });

  // Log detalhado da distribuição
  console.log('📊 [STATUS] Distribuição por grupos:', {
    fechado: groups.fechado.length,
    aSerAtendido: groups.aSerAtendido.length,
    atendidoNaoFechou: groups.atendidoNaoFechou.length,
    perdidoInativo: groups.perdidoInativo.length,
    mentorado: groups.mentorado.length,
    total: leads.length
  });

  // Log dos status em cada grupo perdido/inativo para debug
  const statusPerdidos = groups.perdidoInativo.map(lead => lead.Status).filter(Boolean);
  const statusPerdidosUnicos = [...new Set(statusPerdidos)];
  console.log('❌ [STATUS] Status classificados como perdido/inativo:', statusPerdidosUnicos);

  if (excludeMentorados) {
    console.log(`🎓 [STATUS] Excluindo ${groups.mentorado.length} leads mentorados dos cálculos`);
  } else {
    console.log(`🎓 [STATUS] Incluindo ${groups.mentorado.length} leads mentorados`);
  }

  return groups;
}

export function getLeadsExcludingMentorados(leads: Lead[]): Lead[] {
  const validLeads = leads.filter(lead => classifyLeadByStatus(lead.Status) !== 'mentorado');
  console.log(`🎓 [FILTER] Filtrando mentorados: ${leads.length} → ${validLeads.length} leads válidos`);
  return validLeads;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
}

// Função para validar se todos os leads foram classificados corretamente
export function validateStatusClassification(leads: Lead[]): {
  total: number;
  classified: Record<StatusGroup, number>;
  unclassified: number;
  unmappedStatus: string[];
} {
  const classified: Record<StatusGroup, number> = {
    fechado: 0,
    aSerAtendido: 0,
    atendidoNaoFechou: 0,
    perdidoInativo: 0,
    mentorado: 0
  };

  let unclassified = 0;
  const unmappedStatus: string[] = [];

  leads.forEach(lead => {
    try {
      const originalStatus = lead.Status;
      const group = classifyLeadByStatus(originalStatus);
      classified[group]++;
      
      // Detectar status potencialmente não mapeados
      if (group === 'aSerAtendido' && originalStatus && 
          !['Agendado', 'Confirmado', 'Remarcou', 'DCAUSENTE', ''].includes(originalStatus.trim())) {
        if (!unmappedStatus.includes(originalStatus)) {
          unmappedStatus.push(originalStatus);
        }
      }
    } catch (error) {
      unclassified++;
      console.error('❌ [VALIDATION] Erro ao classificar lead:', lead, error);
    }
  });

  const totalClassified = Object.values(classified).reduce((sum, count) => sum + count, 0);
  
  console.log('📊 [VALIDATION] Classificação de status:');
  console.log(`  Total de leads: ${leads.length}`);
  console.log(`  Classificados: ${totalClassified}`);
  console.log(`  Não classificados: ${unclassified}`);
  console.log('  Distribuição:', classified);
  
  if (unmappedStatus.length > 0) {
    console.warn('⚠️ [VALIDATION] Status potencialmente não mapeados:', unmappedStatus);
  }

  return {
    total: leads.length,
    classified,
    unclassified,
    unmappedStatus
  };
}
