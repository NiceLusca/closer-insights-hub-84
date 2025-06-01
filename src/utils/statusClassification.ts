
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
    description: 'Leads mentorados (excluídos por padrão)',
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
    case 'Número errado':
      return 'perdidoInativo';
    
    case 'Mentorado':
      return 'mentorado';
    
    default:
      console.warn(`Status não reconhecido: "${normalizedStatus}". Classificando como 'A Ser Atendido'.`);
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

  leads.forEach(lead => {
    const group = classifyLeadByStatus(lead.Status);
    groups[group].push(lead);
  });

  if (excludeMentorados) {
    groups.mentorado = [];
  }

  return groups;
}

export function getLeadsExcludingMentorados(leads: Lead[]): Lead[] {
  return leads.filter(lead => classifyLeadByStatus(lead.Status) !== 'mentorado');
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
